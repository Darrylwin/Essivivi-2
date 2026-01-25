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
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  EyeIcon,
  EditIcon,
  Trash2Icon,
  MoreVerticalIcon,
  PackageIcon,
  TagIcon,
  DollarSignIcon,
  ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProduitTableProps {
  produits: any[];
  loading: boolean;
  onView: (produit: any) => void;
  onEdit: (produit: any) => void;
  onDelete: (produit: any) => void;
}

export function ProduitTable({
  produits,
  loading,
  onView,
  onEdit,
  onDelete,
}: ProduitTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "nom",
      header: "Produit",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.photo ? (
            <div className="relative h-8 w-8 overflow-hidden rounded border">
              <img
                src={row.original.photo}
                alt={row.original.nom}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          )}
          <div>
            <div className="font-medium">{row.getValue("nom")}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.marque} {row.original.volume && `• ${row.original.volume}`}
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
          <TagIcon className="h-3 w-3" />
          <Badge variant="outline" className="text-xs">
            {row.getValue("categorie_nom")}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "unite_vente",
      header: "Unité",
      cell: ({ row }) => {
        const unite = row.getValue("unite_vente");
        const labels = {
          sachet: "Sachet",
          bouteille: "Bouteille",
          canette: "Canette",
          pack: "Pack",
        };
        return (
          <Badge variant="secondary">
            {labels[unite as keyof typeof labels]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "prix_unitaire",
      header: "Prix",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <DollarSignIcon className="h-3 w-3 text-green-600" />
          <span className="font-medium">{parseFloat(row.getValue("prix_unitaire")).toLocaleString('fr-FR')} FCFA</span>
        </div>
      ),
    },
    {
      accessorKey: "actif",
      header: "Statut",
      cell: ({ row }) => {
        const actif = row.getValue("actif");
        return (
          <Badge variant={actif ? "default" : "outline"}>
            {actif ? "Actif" : "Inactif"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const produit = row.original;
        
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
              <DropdownMenuItem onClick={() => onView(produit)}>
                <EyeIcon className="mr-2 h-4 w-4" />
                Voir détails
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(produit)}>
                <EditIcon className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(produit)}
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
    data: produits,
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

  if (loading && produits.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Chargement des produits...</div>
      </div>
    );
  }

  if (!loading && produits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <PackageIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
        <p className="text-muted-foreground text-center mb-4">
          Commencez par créer votre premier produit pour remplir votre catalogue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4">
        <Input
          placeholder="Filtrer les produits..."
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
          {table.getFilteredRowModel().rows.length} produit(s)
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