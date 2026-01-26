"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  getPaginationRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  EyeIcon,
  EditIcon,
  Trash2Icon,
  MoreVerticalIcon,
  StoreIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  PhoneIcon,
  MailIcon,
  BuildingIcon,
} from "lucide-react";
import type { ClientList } from "@/lib/types";

interface ClientTableProps {
  clients: ClientList[];
  loading: boolean;
  onView: (client: ClientList) => void;
  onEdit: (client: ClientList) => void;
  onDelete: (client: ClientList) => void;
}

export function ClientTable({
  clients,
  loading,
  onView,
  onEdit,
  onDelete,
}: ClientTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});

  const getTypeBadge = (type: string) => {
    const variants = {
      détaillant: "default",
      grossiste: "secondary",
      institution: "outline",
    } as const;

    const labels = {
      détaillant: "Détaillant",
      grossiste: "Grossiste",
      institution: "Institution",
    };

    return (
      <Badge variant={variants[type as keyof typeof variants]}>
        {labels[type as keyof typeof labels]}
      </Badge>
    );
  };

  const getStatusBadge = (statut: string) => {
    return statut === "actif" ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Actif
      </Badge>
    ) : (
      <Badge variant="destructive">Inactif</Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const columns: ColumnDef<ClientList>[] = [
    {
      accessorKey: "code_client",
      header: "Code",
      cell: ({ row }) => (
        <div className="font-mono font-bold">{row.getValue("code_client")}</div>
      ),
    },
    {
      accessorKey: "nom_point_vente",
      header: "Point de vente",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <StoreIcon className="h-3 w-3 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.getValue("nom_point_vente")}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.adresse}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "nom_responsable",
      header: "Responsable",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <UserIcon className="h-3 w-3 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.getValue("nom_responsable")}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.telephone}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MailIcon className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{row.getValue("email")}</span>
        </div>
      ),
    },
    {
      accessorKey: "type_client",
      header: "Type",
      cell: ({ row }) => getTypeBadge(row.getValue("type_client")),
    },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ row }) => getStatusBadge(row.getValue("statut")),
    },
    {
      accessorKey: "date_inscription",
      header: "Inscription",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-3 w-3" />
          <div className="text-sm">
            {formatDate(row.getValue("date_inscription"))}
          </div>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const client = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView(client)}>
                <EyeIcon className="mr-2 h-4 w-4" />
                Voir détails
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(client)}>
                <EditIcon className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(client)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2Icon className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: clients,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
  });

  if (loading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Chargement des clients...</div>
      </div>
    );
  }

  if (!loading && clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <StoreIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucun client trouvé</h3>
        <p className="text-muted-foreground text-center mb-4">
          Commencez par créer votre premier client.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4">
        <Input
          placeholder="Rechercher un client..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onView(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucun résultat trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} client(s)
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} sur{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}