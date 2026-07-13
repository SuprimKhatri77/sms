import { getStudentCertificates } from "@/lib/api/certificates";
import { queryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export const useStudentCertificates = (
  studentId: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: queryKeys.certificates.student(studentId),
    queryFn: () => getStudentCertificates(studentId),
    enabled,
    staleTime: 1000 * 60,
  });
};
