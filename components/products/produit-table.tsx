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
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  EditIcon,
  Trash2Icon,
  MoreVerticalIcon,
  PackageIcon,
  EyeIcon,
  TagIcon,
  DollarSignIcon,
  ScaleIcon,
  ArrowUpDownIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProduitListItem, UniteVente } from "@/lib/types";

interface ProductTableProps {
  products: ProduitListItem[];
  loading: boolean;
  onEdit: (product: ProduitListItem) => void;
  onDelete: (product: ProduitListItem) => void;
}

export function ProductTable({
  products,
  loading,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "prix_unitaire", desc: true }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});

  const getUnitBadge = (unite: UniteVente) => {
    const unitConfig = {
      sachet: { label: "Sachet", color: "bg-blue-100 text-blue-800" },
      bouteille: { label: "Bouteille", color: "bg-green-100 text-green-800" },
      canette: { label: "Canette", color: "bg-orange-100 text-orange-800" },
      pack: { label: "Pack", color: "bg-purple-100 text-purple-800" },
    };
    
    const config = unitConfig[unite];
    return (
      <Badge className={`${config.color} hover:${config.color}`}>
        {config.label}
      </Badge>
    );
  };

  const formatPrice = (price: string): string => {
    const num = parseFloat(price);
    return isNaN(num) ? "0.00 FCFA" : `${num.toFixed(2)} FCFA`;
  };

  const columns: ColumnDef<ProduitListItem>[] = [
    {
      accessorKey: "nom",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold hover:bg-transparent"
          >
            Produit
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <PackageIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">
              {row.getValue("nom")}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TagIcon className="h-3 w-3" />
              {row.original.marque}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "categorie_nom",
      header: "Catégorie",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <TagIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{row.getValue("categorie_nom")}</span>
        </div>
      ),
    },
    {
      accessorKey: "volume",
      header: "Volume",
      cell: ({ row }) => {
        const volume = row.getValue("volume") as string | null;
        return volume ? (
          <div className="flex items-center gap-2">
            <ScaleIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{volume}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "unite_vente",
      header: "Unité",
      cell: ({ row }) => {
        const unite = row.getValue("unite_vente") as UniteVente;
        return getUnitBadge(unite);
      },
    },
    {
      accessorKey: "prix_unitaire",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold hover:bg-transparent"
          >
            Prix
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-bold">{formatPrice(row.getValue("prix_unitaire"))}</span>
        </div>
      ),
    },
    {
      accessorKey: "actif",
      header: "Statut",
      cell: ({ row }) => {
        const isActive = row.getValue("actif") as boolean;
        return isActive ? (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Actif
          </Badge>
        ) : (
          <Badge variant="outline" className="text-red-600 border-red-200">
            Inactif
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const product = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(product)}>
                <EditIcon className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem className="text-muted-foreground">
                <EyeIcon className="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(product)}
                className="text-destructive focus:text-destructive"
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
    data: products,
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
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (loading && products.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="p-4 rounded-full bg-muted mb-4">
          <PackageIcon className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
        <p className="text-muted-foreground max-w-md">
          Aucun produit ne correspond à vos critères de recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-12">
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
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
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
      
      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} produit(s) au total
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 text-sm">
              <span>Page</span>
              <span className="font-semibold">
                {table.getState().pagination.pageIndex + 1}
              </span>
              <span>sur</span>
              <span className="font-semibold">
                {table.getPageCount()}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}