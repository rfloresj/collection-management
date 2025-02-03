'use client';

import {
  Modal,
  Input,
  Button,
  ModalBody,
  ModalHeader,
} from '@nextui-org/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export default function ItemForm({
  isOpen,
  onClose,
  item,
  collectionAttributes,
}: {
  isOpen: boolean;
  onClose: () => void;
  item?: any;
  collectionAttributes?: any[];
}) {
  const queryClient = useQueryClient();

  const isEdit = !!item?.id;

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: any) => {
      const url = '/api/items';
      const method = isEdit ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { id: item.id, ...data } : data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get_collection_elements'] });
      toast.success(isEdit ? 'Item updated' : 'Item created');
      onClose();
    },
    onError: () => toast.error('Operation failed'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const attributes: Record<string, any> = {};

    collectionAttributes?.forEach((attr) => {
      attributes[attr.name] = formData.get(attr.name);
    });

    mutate({
      name: formData.get('name'),
      tags: formData.get('tags')?.toString().split(','),
      attributes,
      collectionId: item?.collectionId,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior='inside'
      className='max-h-[80vh] z-[1001]'
      size='2xl'
    >
      <ModalHeader className='mx-2 sticky top-0 bg-background z-10'>
        {isEdit ? 'Edit Item' : 'New Item'}
      </ModalHeader>
      <ModalBody className='overflow-y-auto'>
        <div className='space-y-4'>
          <form onSubmit={handleSubmit}>
            <Input
              className='pb-4 gap-1'
              name='name'
              label='Name'
              color='primary'
              required
              defaultValue={item?.name}
            />
            <Input
              className='pb-4 gap-1'
              name='tags'
              label='Tags (comma separated)'
              defaultValue={item?.tags?.join(', ')}
            />

            {collectionAttributes?.map((attr) => (
              <Input
                className='pb-4 gap-1'
                key={attr.name}
                name={attr.name}
                label={attr.label}
                defaultValue={item?.[attr.name]}
              />
            ))}

            <div className='flex justify-end gap-2 mt-4'>
              <Button size='sm' variant='flat' color='danger' onPress={onClose}>
                Cancel
              </Button>
              <Button
                size='sm'
                type='submit'
                color='primary'
                isLoading={isPending}
              >
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      </ModalBody>
    </Modal>
  );
}
