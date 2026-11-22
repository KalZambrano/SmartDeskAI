package pe.edu.utp.smartdesk.dashboard;

import java.util.List;
import java.util.Map;

public record DashboardSummary(
        long total,
        long open,
        long inProgress,
        long pending,
        long resolved,
        long closed,
        long overdue,
        double averageResolutionHours,
        Map<String, Long> byPriority,
        Map<String, Long> byCategory,
        List<WorkloadItem> workload,
        List<TimelinePoint> timeline) {

    public record WorkloadItem(String technician, long activeTickets) {}

    /** Día en UTC (AAAA-MM-DD) con incidencias creadas y resueltas. */
    public record TimelinePoint(String date, long created, long resolved) {}
}
