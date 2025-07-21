from bson import ObjectId
from flask_pymongo import PyMongo
from utils.db import mongo

class Board:
    @staticmethod
    def create_initial_board(user_id, username):
        initial_board = {
            "user_id": ObjectId(user_id),
            "name": f"{username}'s Board",  # Set the board name to <username>'s Board
            "lists": [
                {"id": "list1", "title": "Planning (To Do)", "cards": []},
                {"id": "list2", "title": "Monitoring (In Progress)", "cards": []},
                {"id": "list3", "title": "Controlling (Review)", "cards": []},
                {"id": "list4", "title": "Reflection (Done)", "cards": []}
            ]
        }
        result = mongo.db.boards.insert_one(initial_board)
        return str(result.inserted_id)

    @staticmethod
    def get_all_boards():
        return list(mongo.db.boards.find({}))

    @staticmethod
    def find_board_by_user_id(user_id):
        try:
            return mongo.db.boards.find_one({"user_id": ObjectId(user_id)})
        except Exception as e:
            print(f"Error finding board by user ID: {str(e)}")
            return None

    @staticmethod
    def update_board(board_id, user_id, lists):
        try:
            result = mongo.db.boards.update_one(
                {"_id": ObjectId(board_id), "user_id": ObjectId(user_id)},
                {"$set": {"lists": lists}}
            )
            return result
        except Exception as e:
            print(f"Error updating board: {str(e)}")
            return None

    @staticmethod
    def search_boards(user_id, query):
        # Example: search by board name containing the query (case-insensitive)
        return list(mongo.db.boards.find({
            "user_id": ObjectId(user_id),
            "name": {"$regex": query, "$options": "i"}
        }))

    @staticmethod
    def get_progress_report(user_id):
        board = Board.find_board_by_user_id(user_id)
        if not board:
            return None
        lists = board.get("lists", [])
        total_cards = 0
        done_cards = 0
        report = {}
        strategy_stats = {}
        course_stats = {}
        strategy_usage = {}
        active_cards = []
        for list_data in lists:
            list_name = list_data.get("title", "Unknown")
            cards = list_data.get("cards", [])
            card_count = len([c for c in cards if not c.get("archived") and not c.get("deleted")])
            report[list_name] = card_count
            total_cards += card_count
            if list_name == "Reflection (Done)":
                done_cards = card_count
            active_cards.extend([c for c in cards if not c.get("archived") and not c.get("deleted")])
        for card in active_cards:
            strategy = card.get("learning_strategy")
            course_name = card.get("course_name", "").strip()
            
            if strategy and course_name:
                if strategy not in strategy_usage:
                    strategy_usage[strategy] = {}
                if course_name not in strategy_usage[strategy]:
                    strategy_usage[strategy][course_name] = 0
                strategy_usage[strategy][course_name] += 1
            if strategy and strategy not in strategy_stats:
                strategy_stats[strategy] = {
                    "pre_test": {"grades": [], "min": 100, "q1": 0, "median": 0, "q3": 0, "max": 0, "count": 0},
                    "post_test": {"grades": [], "min": 100, "q1": 0, "median": 0, "q3": 0, "max": 0, "count": 0}
                }
            if course_name and course_name not in course_stats:
                course_stats[course_name] = {
                    "pre_test": {"grades": [], "avg": 0, "count": 0},
                    "post_test": {"grades": [], "avg": 0, "count": 0}
                }
            pre_test_grade = card.get("pre_test_grade")
            if pre_test_grade and pre_test_grade.strip():
                try:
                    grade = float(pre_test_grade)
                    if strategy:
                        strategy_stats[strategy]["pre_test"]["grades"].append(grade)
                    if course_name:
                        course_stats[course_name]["pre_test"]["grades"].append(grade)
                except ValueError:
                    pass
            post_test_grade = card.get("post_test_grade")
            if post_test_grade and post_test_grade.strip():
                try:
                    grade = float(post_test_grade)
                    if strategy:
                        strategy_stats[strategy]["post_test"]["grades"].append(grade)
                    if course_name:
                        course_stats[course_name]["post_test"]["grades"].append(grade)
                except ValueError:
                    pass
        for strategy in strategy_stats:
            for grade_type in ["pre_test", "post_test"]:
                grades = strategy_stats[strategy][grade_type]["grades"]
                if grades:
                    grades.sort()
                    count = len(grades)
                    strategy_stats[strategy][grade_type].update({
                        "min": grades[0],
                        "max": grades[-1],
                        "count": count
                    })
                    if count >= 4:
                        q1_index = count // 4
                        median_index = count // 2
                        q3_index = (3 * count) // 4
                        strategy_stats[strategy][grade_type].update({
                            "q1": grades[q1_index],
                            "median": grades[median_index],
                            "q3": grades[q3_index]
                        })
                    elif count > 0:
                        strategy_stats[strategy][grade_type].update({
                            "q1": grades[0],
                            "median": grades[0],
                            "q3": grades[0]
                        })
                del strategy_stats[strategy][grade_type]["grades"]
        for course_name in course_stats:
            for grade_type in ["pre_test", "post_test"]:
                grades = course_stats[course_name][grade_type]["grades"]
                if grades:
                    avg = sum(grades) / len(grades)
                    course_stats[course_name][grade_type].update({
                        "avg": round(avg, 2),
                        "count": len(grades)
                    })
                del course_stats[course_name][grade_type]["grades"]
        progress_percentage = (done_cards / total_cards * 100) if total_cards > 0 else 0
        top_strategies = []
        for strategy, courses in strategy_usage.items():
            total_usage = sum(courses.values())
            most_used_course = max(courses.items(), key=lambda x: x[1])[0]
            top_strategies.append({
                "strategy": strategy,
                "count": total_usage,
                "most_used_in": most_used_course
            })
        top_strategies.sort(key=lambda x: x["count"], reverse=True)
        top_strategies = top_strategies[:3]
        return {
            "total_cards": total_cards,
            "done_cards": done_cards,
            "progress_percentage": progress_percentage,
            "list_report": report,
            "strategy_stats": strategy_stats,
            "course_stats": course_stats,
            "top_strategies": top_strategies
        }
