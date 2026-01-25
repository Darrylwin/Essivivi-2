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
  TruckIcon,
  UserIcon,
  MapPinIcon,
  PackageIcon,
  CalendarIcon,
  DollarSignIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "lucide-react";
import type { Commande } from "@/lib/types";

interface CommandeTableProps {
  commandes: Commande[];
  loading: boolean;
  onView: (commande: Commande) => void;
  onEdit: (commande: Commande) => void;
  onAssign: (commande: Commande) => void;
  onChangeStatus: (commande: Commande) => void;
}

export function CommandeTable({
  commandes,
  loading,
  onView,
  onEdit,
  onAssign,
  onChangeStatus,
}: CommandeTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});

  const getStatusBadge = (statut: string) => {
    const variants = {
      en_attente: "secondary",
      acceptee: "outline",
      en_cours: "default",
      livree: "default",
      annulee: "destructive",
    } as const;

    const icons = {
      en_attente: ClockIcon,
      acceptee: CheckCircleIcon,
      en_cours: TruckIcon,
      livree: CheckCircleIcon,
      annulee: XCircleIcon,
    };

    const labels = {
      en_attente: "En attente",
      acceptee: "Acceptée",
      en_cours: "En cours",
      livree: "Livrée",
      annulee: "Annulée",
    };

    const Icon = icons[statut as keyof typeof icons];
    const variant = variants[statut as keyof typeof variants];

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {labels[statut as keyof typeof labels]}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns: ColumnDef<Commande>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-sm">#{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "client_nom",
      header: "Client",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <UserIcon className="h-3 w-3 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.getValue("client_nom")}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.client_code}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "agent_nom",
      header: "Agent",
      cell: ({ row }) => {
        const agentNom = row.getValue("agent_nom");
        return agentNom ? (
          <div className="flex items-center gap-2">
            <TruckIcon className="h-3 w-3 text-muted-foreground" />
            <div>
              <div className="font-medium">{String(agentNom)}</div>
              <div className="text-xs text-muted-foreground">
                {row.original.agent_numero}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground text-sm italic">Non assignée</div>
        );
      },
    },
    {
      accessorKey: "quantite_totale",
      header: "Quantité",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <PackageIcon className="h-3 w-3" />
          <span className="font-medium">{row.getValue("quantite_totale")} unités</span>
        </div>
      ),
    },
    {
      accessorKey: "montant_total",
      header: "Montant",
      cell: ({ row }) => {
        const montant = parseFloat(row.getValue("montant_total"));
        return (
          <div className="flex items-center gap-2">
            <DollarSignIcon className="h-3 w-3 text-green-600" />
            <span className="font-medium">
              {montant.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ row }) => getStatusBadge(row.getValue("statut")),
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-3 w-3" />
          <div className="text-sm">
            {formatDate(row.getValue("created_at"))}
          </div>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const commande = row.original;
        const canEdit = commande.statut === 'en_attente';
        const canAssign = commande.statut === 'en_attente';
        const canChangeStatus = commande.statut !== 'livree' && commande.statut !== 'annulee';
        
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
              <DropdownMenuItem onClick={() => onView(commande)}>
                <EyeIcon className="mr-2 h-4 w-4" />
                Voir détails
              </DropdownMenuItem>
              
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit(commande)}>
                  <EditIcon className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
              )}
              
              {canAssign && (
                <DropdownMenuItem onClick={() => onAssign(commande)}>
                  <TruckIcon className="mr-2 h-4 w-4" />
                  Assigner
                </DropdownMenuItem>
              )}
              
              {canChangeStatus && (
                <DropdownMenuItem onClick={() => onChangeStatus(commande)}>
                  <CheckCircleIcon className="mr-2 h-4 w-4" />
                  Changer statut
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: commandes,
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

  if (loading && commandes.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Chargement des commandes...</div>
      </div>
    );
  }

  if (!loading && commandes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <PackageIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucune commande trouvée</h3>
        <p className="text-muted-foreground text-center mb-4">
          Aucune commande n&apos;a été passée pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4">
        <Input
          placeholder="Rechercher une commande..."
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
          {table.getFilteredRowModel().rows.length} commande(s)
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