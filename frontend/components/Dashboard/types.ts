export interface ProgressReport {
    total_cards: number
    done_cards: number
    progress_percentage: number
    list_report: {
        [key: string]: number
    }
    strategy_stats: {
        [key: string]: {
            pre_test: {
                min: number
                q1: number
                median: number
                q3: number
                max: number
                count: number
            }
            post_test: {
                min: number
                q1: number
                median: number
                q3: number
                max: number
                count: number
            }
        }
    }
    course_stats: {
        [key: string]: {
            pre_test: {
                avg: number
                count: number
            }
            post_test: {
                avg: number
                count: number
            }
        }
    }
    top_strategies: {
        strategy: string
        count: number
        most_used_in: string
    }[]
}

export interface BoxPlotData {
    min: number
    q1: number
    median: number
    q3: number
    max: number
    count: number
}

export interface ChartColors {
    planning: string
    monitoring: string
    controlling: string
    review: string
    preTest: string
    postTest: string
}

export interface ChartBorderColors {
    planning: string
    monitoring: string
    controlling: string
    review: string
    preTest: string
    postTest: string
}

export interface TaskDistributionProps {
    listReport: {
        [key: string]: number
    }
    topStrategies: {
        strategy: string
        count: number
        most_used_in: string
    }[]
}

export interface CoursePerformanceProps {
    courseStats: {
        [key: string]: {
            pre_test: {
                avg: number
                count: number
            }
            post_test: {
                avg: number
                count: number
            }
        }
    }
} 