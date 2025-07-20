from utils.db import mongo
from datetime import datetime

class Course:
    @staticmethod
    def add_course(course_code, course_name):
        course_data = {
            "course_code": course_code,
            "course_name": course_name,
            "created_at": datetime.utcnow()
        }
        course_id = mongo.db.courses.insert_one(course_data).inserted_id
        return course_id

    @staticmethod
    def find_course_by_code(course_code):
        return mongo.db.courses.find_one({"course_code": course_code})

    @staticmethod
    def find_all_courses():
        return list(mongo.db.courses.find({}))

    @staticmethod
    def get_course_by_code(course_code):
        course = mongo.db.courses.find_one({"course_code": course_code})
        if course:
            course["_id"] = str(course["_id"])
        return course

    @staticmethod
    def get_all_courses():
        courses = list(mongo.db.courses.find({}))
        for course in courses:
            course["_id"] = str(course["_id"])
        return courses

    @staticmethod
    def update_course(course_code, updates):
        allowed_updates = {"course_code", "course_name", "materials"}
        filtered_updates = {key: value for key, value in updates.items() if key in allowed_updates}
        if not filtered_updates:
            return None, "No valid fields to update"
        result = mongo.db.courses.update_one({"course_code": course_code}, {"$set": filtered_updates})
        return result, None

    @staticmethod
    def delete_course(course_code):
        result = mongo.db.courses.delete_one({"course_code": course_code})
        return result

    @staticmethod
    def update_existing_courses():
        # Update all existing courses that don't have created_at
        current_time = datetime.utcnow()
        result = mongo.db.courses.update_many(
            {"created_at": {"$exists": False}},
            {"$set": {"created_at": current_time}}
        )
        return result.modified_count
