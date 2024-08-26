"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  ListboxItem,
  Listbox,
  CircularProgress,
} from "@nextui-org/react";
import { PlusIcon } from "./PlusIcon";
import { VerticalDotsIcon } from "./VerticalDotsIcon";
import { SearchIcon } from "./SearchIcon";
import { columns } from "./data";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Key } from "@react-types/shared";
import { useQuery } from "@tanstack/react-query";

interface SortDescriptor {
  column: string;
  direction: "ascending" | "descending";
}

function DashboardTable() {
  const {
    isPending,
    data: collections,
  } = useQuery({
    queryKey: ["get_collections"],
    queryFn: async () => {
      const response = await fetch(`/api/collections`);
      return await response.json();
    },
  });

  const [selectedCollection, setSelectedCollection] = useState<
    number | undefined
  >();

  const tableColumns = useMemo(() => {
    if(!selectedCollection) {
      return columns;
    }

    const currentCollection = collections.find(
      ({ id }: { id: number }) => id === id
    );

    if (currentCollection?.attributes) {
      const newColsArr = JSON.parse(currentCollection?.attributes);
      const customCols = newColsArr.map(
        ({ name, label }: { name: string; label: string }) => {
          return {
            uid: name,
            name: label,
            sortable: true,
          };
        }
      );

      return [...columns, ...customCols, { name: "ACTIONS", uid: "actions" }];
    }

    return columns;
  }, [selectedCollection]);

  const { data: collectionItems } = useQuery({
    queryKey: ["get_collection_elements", selectedCollection],
    queryFn: async () => {
      const response = await fetch(
        `/api/items?collectionId=${selectedCollection}`
      );
      const items = await response.json();

      const parsedItems = items.map(
        ({ attributes, ...rest }: { attributes: string }) => {
          const customCols = attributes ? JSON.parse(attributes) : {};

          return { ...rest, ...customCols };
        }
      );

      return parsedItems;
    },
    enabled: !!selectedCollection,
  });

  const [filterValue, setFilterValue] = useState<string>("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));

  const handleSelectionChange = (keys: "all" | Set<Key>) => {
    if (keys === "all") {
      setSelectedKeys(
        new Set(collectionItems?.map((item) => item.id.toString()))
      );
    } else {
      setSelectedKeys(new Set(Array.from(keys).map((key) => key.toString())));
    }
  };

  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });
  const handleSortChange = (descriptor: any) => {
    setSortDescriptor({
      column: descriptor.column as string,
      direction: descriptor.direction,
    });
  };

  const [page, setPage] = useState<number>(1);

  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    if (!collectionItems || !Array.isArray(collectionItems)) {
      return [];
    }
    let filtered = [...collectionItems];

    if (hasSearchFilter) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filtered;
  }, [filterValue, collectionItems]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback((item: any, columnKey: Key) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case "tags":
        return (
          <div className="flex flex-row gap-1">
            {cellValue?.map?.((tag: string) => (
              <Chip color="primary">{tag}</Chip>
            ))}
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <VerticalDotsIcon className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem>View</DropdownItem>
                <DropdownItem>Edit</DropdownItem>
                <DropdownItem>Delete</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const onNextPage = useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const onSearchChange = useCallback((value: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4 py-0">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by name..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Button color="primary" endContent={<PlusIcon />}>
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {collectionItems?.length} items
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    onRowsPerPageChange,
    collectionItems?.length,
    onSearchChange,
    hasSearchFilter,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys.size === filteredItems.length
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={page <= 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={page >= pages}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  return (
    <div className="flex flex-row m-8 gap-4 justify-center align-center">
      {isPending ? (
        <CircularProgress color="secondary" aria-label="Loading..." size="lg" />
      ) : (
        <>
          <Listbox
            aria-label="User Menu"
            onAction={(key) => setSelectedCollection(Number(key))}
            className="p-0 gap-0 divide-y divide-default-300/50 dark:divide-default-100/80 max-w-[250px] overflow-visible shadow-small rounded-medium"
            itemClasses={{
              base: "px-3 first:rounded-t-medium last:rounded-b-medium rounded-none gap-3 h-12 data-[hover=true]:bg-default-100/80",
            }}
            topContent={
              <Button color="primary" className="mx-8 my-4">
                New Collection
              </Button>
            }
          >
            {collections?.map(({ id, name }: any) => (
              <ListboxItem key={id}>{name}</ListboxItem>
            ))}
          </Listbox>
          <Table
            aria-label="Table with custom cells, pagination and sorting"
            isHeaderSticky
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            classNames={{
              wrapper: "max-h-[382px]",
            }}
            selectedKeys={selectedKeys}
            selectionMode="multiple"
            sortDescriptor={sortDescriptor}
            topContent={topContent}
            topContentPlacement="outside"
            onSelectionChange={handleSelectionChange}
            onSortChange={handleSortChange}
          >
            <TableHeader columns={tableColumns}>
              {(column) => (
                <TableColumn
                  key={column.uid}
                  align={column.uid === "actions" ? "center" : "start"}
                  allowsSorting={column.sortable}
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody emptyContent={"No items found"} items={sortedItems}>
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(item, columnKey as Key)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}

export default DashboardTable;
