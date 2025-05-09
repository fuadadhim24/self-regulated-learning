export interface ProgressReport {
    total_cards: number
    done_cards: number
    progress_percentage: number
    list_report: Record<string, number>
    strategy_stats: Record<
        string,
        {
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
    >
    course_stats: Record<
        string,
        {
            pre_test: {
                avg: number
                count: number
            }
            post_test: {
                avg: number
                count: number
            }
        }
    >
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