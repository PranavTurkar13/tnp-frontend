// This hook is used to fetch the statistics for the admin dashboard.
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Statistics {
    totalStudents: number;
    placedStudents: number;
    totalPostings: number;
}

export function useStatistics() {
    return useQuery({
        queryKey: ["admin-statistics"],
        queryFn: async () => {
            const { data } = await axios.get("/api/my-proxy/api/v1/admin/statistics"); ``
            return data.statistics as Statistics;
        },
        staleTime: 60 * 60 * 1000,
    });
}
