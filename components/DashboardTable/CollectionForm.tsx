'use client';

import {
  Modal,
  ModalHeader,
  ModalBody,
  Input,
  Button,
  Textarea,
} from '@nextui-org/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export default function CollectionForm({
  isOpen,
  onClose,
  collection,
}: {
  isOpen: boolean;
  onClose: () => void;
  collection?: any;
}) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: any) => {
      const url = '/api/collections';
      const method = collection ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          collection ? { id: collection.id, ...data } : data
        ),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get_collections'] });
      toast.success(collection ? 'Collection updated' : 'Collection created');
      onClose();
    },
    onError: () => toast.error('Operation failed'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutate({
      name: formData.get('name'),
      description: formData.get('description'),
      attributes: [],
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      className="max-h-[80vh] z-[1001]"
      size="2xl"
    >
      <ModalHeader className='sticky top-0 bg-background z-10'>
        {collection ? 'Edit Collection' : 'New Collection'}
      </ModalHeader>
      <ModalBody className="overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <Input
            className='pb-4 gap-1'
            name='name'
            label='Name'
            color='primary'
            required
            defaultValue={collection?.name}
          />
          <Textarea
            name='description'
            label='Description'
            defaultValue={collection?.description}
          />
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
              {collection ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}
