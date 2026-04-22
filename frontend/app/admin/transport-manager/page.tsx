"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import UniversalTable, {
  HeaderActionGroup,
} from "@/components/universal-table/UniversalTable";
import { Column } from "@/components/universal-table/table.types";
import { Card, CardContent } from "@/components/ui/card";
import { UserAction, UserListRoleFilter } from "@/service/user";
import { toast } from "sonner";

type TransportManagerRow = {
  _id: string;
  name: string;
  email: string;
  registeredDate: string;
  isActive: boolean;
  assignedVehicles: number;
};

const PAGE_SIZE = 10;
const PAGE_ROLE_FILTER: UserListRoleFilter = "transport-manager";

const formatDateTime = (value?: string | null) => {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  const datePart = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });

  const timePart = date
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(" ", "");

  return `${datePart}, ${timePart}`;
};

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <span
    className={`inline-flex min-w-22.5 items-center justify-center rounded-xs border px-2 py-1 text-xs font-medium whitespace-nowrap sm:min-w-27.5 sm:px-3 sm:text-sm md:text-base ${
      isActive
        ? "border-[#6FCF97] bg-[#EAF9EF] text-[#27AE60]"
        : "border-[#8D8D8D] bg-[#F2F2F2] text-[#1F1F1F]"
    }`}
  >
    {isActive ? "Active" : "In Active"}
  </span>
);

const columns: Column<TransportManagerRow>[] = [
  {
    key: "name",
    title: "NAME",
    render: (row) => (
      <span className="block max-w-42.5 truncate text-sm font-medium sm:max-w-55 md:max-w-65 md:text-base">
        {row.name}
      </span>
    ),
  },
  {
    key: "email",
    title: "EMAIL",
    render: (row) => (
      <span className="text-sm whitespace-nowrap md:text-base">{row.email}</span>
    ),
  },
  {
    key: "assignedVehicles",
    title: "ASSIGNED VEHICLES",
    render: (row) => (
      <span className="text-sm whitespace-nowrap md:text-base">
        {row.assignedVehicles}
      </span>
    ),
  },
  {
    key: "registeredDate",
    title: "REGISTERED DATE",
    render: (row) => (
      <span className="text-sm whitespace-nowrap md:text-base">
        {row.registeredDate}
      </span>
    ),
  },
  {
    key: "isActive",
    title: "STATUS",
    render: (row) => <StatusBadge isActive={row.isActive} />,
  },
];

export default function AdminTransportManagerPage() {
  const [rows, setRows] = useState<TransportManagerRow[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedSearchValue(searchValue.trim());
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchValue]);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await UserAction.getAllUsers({
        role: PAGE_ROLE_FILTER,
        searchKey: debouncedSearchValue || undefined,
        showPerPage: PAGE_SIZE,
        pageNo: currentPage,
      });

      if (!response.success || !Array.isArray(response.data)) {
        toast.error(response.message || "Failed to load transport managers");
        setRows([]);
        setTotalData(0);
        setTotalPages(1);
        return;
      }

      const mappedRows: TransportManagerRow[] = response.data.map((item) => ({
        _id: item._id,
        name: item.fullName,
        email: item.email,
        assignedVehicles: item.assignedVehicle || 0,
        registeredDate: formatDateTime(item.createdAt),
        isActive: Boolean(item.isActive),
      }));

      const nextTotalPages = Math.max(response.totalPages || 1, 1);

      setRows(mappedRows);
      setTotalData(response.totalData || 0);
      setTotalPages(nextTotalPages);
      setCurrentPage((prev) => {
        const safePage = Math.max(response.currentPage || prev || 1, 1);
        return safePage > nextTotalPages ? nextTotalPages : safePage;
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load transport managers";
      toast.error(message);
      setRows([]);
      setTotalData(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearchValue]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const headerActionGroups: HeaderActionGroup[] = useMemo(
    () => [
      {
        title: `Total Transport Managers: ${totalData}`,
        startingActionGroup: [],
        endActionGroup: [
          {
            label: "Search",
            onClick: (value) => {
              setSearchValue(value ?? "");
              setCurrentPage(1);
            },
            search: true,
            visibility: true,
            inputClassName:
              "h-9 w-[135px] rounded-none border border-[#ECECEC] bg-white text-xs shadow-none placeholder:text-[#9B9B9B] sm:h-10 sm:w-[220px] sm:text-sm",
            positionIndex: 1,
          },
          {
            label: "Filters",
            onClick: () => {
              setCurrentPage(1);
            },
            filter: true,
            options: ["Transport Manager"],
            visibility: true,
            selectTriggerCalssName:
              "h-9 min-w-[96px] rounded-none border border-[#D6D6D6] bg-[#F9F9F9] text-xs text-[#6A6A6A] sm:h-10 sm:min-w-[110px] sm:text-sm",
            selectItemClassName: "text-sm",
            positionIndex: 2,
          },
        ],
      },
    ],
    [totalData],
  );

  const visiblePages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const start = Math.max(currentPage - 2, 1);
    const end = Math.min(start + 4, totalPages);
    const adjustedStart = Math.max(end - 4, 1);

    return Array.from(
      { length: end - adjustedStart + 1 },
      (_, index) => adjustedStart + index,
    );
  }, [currentPage, totalPages]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const isInitialLoading = isLoading && rows.length === 0;

  return (
    <div className="bg-white px-1 pb-2 sm:px-0">
      <h1 className="mb-4 text-2xl leading-tight font-medium text-[#0d4b9f] sm:mb-6 sm:text-4xl md:mb-10 md:text-5xl">
        Transport Manager
      </h1>

      <Card className="rounded-sm border-none bg-[#f8f9fc] shadow-[0_6px_18px_rgba(13,75,159,0.08)]">
        <CardContent className="p-3 sm:p-4 md:p-5">
          {isInitialLoading ? (
            <div className="flex min-h-64 items-center justify-center rounded-sm bg-[#F9F9FA] text-sm text-[#8F8F8F] sm:text-base">
              <span
                className="h-9 w-9 animate-spin rounded-full border-3 border-[#0d4b9f]/25 border-t-[#0d4b9f]"
                aria-label="Loading"
              />
            </div>
          ) : (
            <>
              <UniversalTable<TransportManagerRow>
                data={rows}
                columns={columns}
                rowKey={(row) => row._id}
                headerActionGroups={headerActionGroups}
              />

              <div className="mt-4 flex flex-wrap items-center justify-center gap-1 text-xs text-[#8F8F8F] sm:mt-6">
                <button
                  className="rounded border border-[#EBEBEB] px-2 py-1 text-[#C0C0C0] disabled:cursor-not-allowed"
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1 || isLoading}
                >
                  {'<'} Back
                </button>

                {visiblePages.map((pageNo) => {
                  const isActive = pageNo === currentPage;

                  return (
                    <button
                      key={pageNo}
                      className={`rounded border px-2 py-1 ${
                        isActive
                          ? "border-[#0d4b9f] bg-[#0d4b9f] text-white"
                          : "border-[#EBEBEB]"
                      }`}
                      type="button"
                      onClick={() => setCurrentPage(pageNo)}
                      disabled={isLoading}
                    >
                      {pageNo}
                    </button>
                  );
                })}

                <button
                  className="rounded border border-[#EBEBEB] px-2 py-1 text-[#C0C0C0] disabled:cursor-not-allowed"
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Next {'>'}
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
