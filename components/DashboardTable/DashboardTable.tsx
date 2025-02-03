'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Key } from '@react-types/shared';
import { toast } from 'react-toastify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
} from '@nextui-org/react';

import { PlusIcon } from './PlusIcon';
import { VerticalDotsIcon } from './VerticalDotsIcon';
import { SearchIcon } from './SearchIcon';
import { columns } from './data';
import CollectionForm from './CollectionForm';
import ItemForm from './ItemForm';

interface SortDescriptor {
  column: string;
  direction: 'ascending' | 'descending';
}

function DashboardTable() {
  const { isPending, data: collections } = useQuery({
    queryKey: ['get_collections'],
    queryFn: async () => {
      const response = await fetch(`/api/collections`);
      return await response.json();
    },
  });

  const [selectedCollection, setSelectedCollection] = useState<
    number | undefined
  >();
  const [filterValue, setFilterValue] = useState<string>('');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'id',
    direction: 'ascending',
  });
  const [page, setPage] = useState<number>(1);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    setEditingItem(null);
    setShowCollectionForm(false);
  }, [selectedCollection]);

  const deleteCollection = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch('/api/collections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get_collections'] });
      toast.success('Collection deleted');
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch('/api/items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get_collection_elements'] });
      toast.success('Item deleted');
    },
  });

  const tableColumns = useMemo(() => {
    if (!selectedCollection) {
      return columns;
    }

    const currentCollection = collections.find(
      ({ id }: { id: number }) => id === selectedCollection
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

      return [...columns, ...customCols, { name: 'ACTIONS', uid: 'actions' }];
    }

    return columns;
  }, [selectedCollection]);

  const { data: collectionItems } = useQuery({
    queryKey: ['get_collection_elements', selectedCollection],
    queryFn: async () => {
      const response = await fetch(
        `/api/items?collectionId=${selectedCollection}`
      );
      const items = await response.json();
      return items.map((item: any) => ({
        ...item,
        ...item.attributes,
      }));
    },
    enabled: !!selectedCollection,
  });

  const handleSelectionChange = (keys: 'all' | Set<Key>) => {
    if (keys === 'all') {
      setSelectedKeys(
        new Set(collectionItems?.map((item: any) => item.id.toString()))
      );
    } else {
      setSelectedKeys(new Set(Array.from(keys).map((key) => key.toString())));
    }
  };

  const handleSortChange = (descriptor: any) => {
    setSortDescriptor({
      column: descriptor.column as string,
      direction: descriptor.direction,
    });
  };

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
      const compareValues = (first: any, second: any) => {
        if (first < second) return -1;
        if (first > second) return 1;
        return 0;
      };

      const cmp = compareValues(first, second);

      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback((item: any, columnKey: Key) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case 'tags':
        return (
          <div className='flex flex-row gap-1'>
            {cellValue?.map?.((tag: string, index: number) => (
              <Chip key={`${tag}-${index}`} color='secondary'>
                {tag}
              </Chip>
            ))}
          </div>
        );
      case 'actions':
        return (
          <div className='relative flex justify-end items-center gap-2'>
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size='sm' variant='light'>
                  <VerticalDotsIcon className='text-default-300' />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  key='edit'
                  onPress={() => {
                    console.log('Editing item', item);
                    setEditingItem(item);
                    setEditingCollection(null);
                    setShowCollectionForm(false);
                  }}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  key='delete'
                  onPress={() => deleteItem.mutate(item.id)}
                >
                  Delete
                </DropdownItem>
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
      setFilterValue('');
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue('');
    setPage(1);
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className='flex flex-col gap-4 py-0'>
        <div className='flex justify-between gap-3 items-end'>
          <Input
            isClearable
            className='w-full sm:max-w-[44%]'
            placeholder='Search by name...'
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className='flex gap-3'>
            <Button
              color='primary'
              endContent={<PlusIcon />}
              onPress={() => {
                if (!selectedCollection) {
                  toast.error('Please select a collection first');
                  return;
                }
                setShowCollectionForm(false);
                setEditingItem({
                  collectionId: selectedCollection,
                });
              }}
            >
              Add New
            </Button>
          </div>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-default-400 text-small'>
            Total {collectionItems?.length} items
          </span>
          <label className='flex items-center text-default-400 text-small'>
            Rows per page:
            <select
              className='bg-transparent outline-none text-default-400 text-small'
              onChange={onRowsPerPageChange}
            >
              <option value='5'>5</option>
              <option value='10'>10</option>
              <option value='15'>15</option>
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
      <div className='flex justify-between items-center'>
        <span className='w-[30%] text-small text-default-400'>
          {selectedKeys.size === filteredItems.length
            ? 'All items selected'
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color='primary'
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className='hidden sm:flex w-[30%] justify-end gap-2'>
          <Button
            isDisabled={page <= 1}
            size='sm'
            variant='flat'
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={page >= pages}
            size='sm'
            variant='flat'
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  return (
    <div className='flex flex-row m-8 gap-4 justify-center align-center'>
      {isPending ? (
        <CircularProgress color='secondary' aria-label='Loading...' size='lg' />
      ) : (
        <>
          <Listbox
            aria-label='User Menu'
            onAction={(key) => setSelectedCollection(Number(key))}
            className='p-0 gap-0 divide-y divide-default-300/50 dark:divide-default-100/80 max-w-[250px] overflow-visible shadow-small rounded-medium'
            itemClasses={{
              base: 'px-3 first:rounded-t-medium last:rounded-b-medium rounded-none gap-3 h-12 data-[hover=true]:bg-default-100/80',
            }}
            topContent={
              <Button
                color='primary'
                className='mx-8 my-4'
                onPress={() => {
                  setEditingCollection(null);
                  setShowCollectionForm(true);
                  setEditingItem(false);
                }}
              >
                New Collection
              </Button>
            }
          >
            {collections?.map((collection: any) => (
              <ListboxItem key={collection.id} textValue={collection.name}>
                <div className='flex justify-between items-center w-full'>
                  <span>{collection.name}</span>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly size='sm' variant='light'>
                        <VerticalDotsIcon className='text-default-300' />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem
                        key='edit'
                        onPress={() => {
                          setEditingCollection(collection);
                          setShowCollectionForm(true);
                          setEditingItem(null);
                        }}
                      >
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        key='delete'
                        onPress={() => deleteCollection.mutate(collection.id)}
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </ListboxItem>
            ))}
          </Listbox>
          <Table
            aria-label='Table with custom cells, pagination and sorting'
            isHeaderSticky
            bottomContent={bottomContent}
            bottomContentPlacement='outside'
            classNames={{
              wrapper: 'max-h-[382px]',
            }}
            selectedKeys={selectedKeys}
            selectionMode='multiple'
            sortDescriptor={sortDescriptor}
            topContent={topContent}
            topContentPlacement='outside'
            onSelectionChange={handleSelectionChange}
            onSortChange={handleSortChange}
          >
            <TableHeader columns={tableColumns}>
              {(column) => (
                <TableColumn
                  key={column.uid}
                  align={column.uid === 'actions' ? 'center' : 'start'}
                  allowsSorting={column.sortable}
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody emptyContent={'No items found'} items={sortedItems}>
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className='flex flex-row m-8 gap-4 justify-center align-center relative'>
            {/* Render modals */}
            <div className='fixed z-[1000]'>
              {showCollectionForm && (
                <CollectionForm
                  isOpen={showCollectionForm}
                  onClose={() => setShowCollectionForm(false)}
                  collection={editingCollection}
                />
              )}

              {editingItem && (
                <ItemForm
                  key={editingItem.id ? editingItem.id : 'new-item'}
                  isOpen={!!editingItem}
                  onClose={() => setEditingItem(null)}
                  item={editingItem}
                  collectionAttributes={
                    selectedCollection
                      ? JSON.parse(
                          collections.find(
                            (c: any) => c.id === selectedCollection
                          )?.attributes || '[]'
                        )
                      : []
                  }
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardTable;
