'use client';

import { Modal, Input, Button, ModalBody, ModalHeader } from '@nextui-org/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

interface CustomField {
  name: string;
  value: string;
}

interface ItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  item?: any;
  collectionAttributes?: any[];
}

export default function ItemForm({ isOpen, onClose, item, collectionAttributes }: ItemFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!item?.id;

  const [name, setName] = useState(item?.name || '');
  const [tags, setTags] = useState(item?.tags?.join(', ') || '');

  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  useEffect(() => {
    if (collectionAttributes && collectionAttributes.length > 0) {
      const initialFields = collectionAttributes.map((attr: any) => ({
        name: attr.name,
        value: item ? item[attr.name] || '' : '',
      }));
      setCustomFields(initialFields);
    } else {
      setCustomFields([]);
    }
  }, [item, collectionAttributes]);

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

    const attributes: Record<string, string> = {};
    customFields.forEach((field) => {
      if (field.name.trim() !== '') {
        attributes[field.name.trim()] = field.value;
      }
    });

    mutate({
      name,
      tags: tags.split(',').map((tag: string) => tag.trim()),
      attributes,
      collectionId: item?.collectionId,
    });
  };

  const addCustomField = () => {
    setCustomFields((prev) => [...prev, { name: '', value: '' }]);
  };

  const updateCustomField = (index: number, field: Partial<CustomField>) => {
    setCustomFields((prev) => {
      const newFields = [...prev];
      newFields[index] = { ...newFields[index], ...field };
      return newFields;
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
        <form onSubmit={handleSubmit} className='space-y-4'>
          <Input
            className='pb-4'
            name='name'
            label='Name'
            color='primary'
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            className='pb-4'
            name='tags'
            label='Tags (comma separated)'
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          {customFields.map((field, index) => (
            <div key={index} className='flex gap-2'>
              <Input
                className='pb-4'
                name={`custom-name-${index}`}
                label='Attribute Name'
                placeholder='e.g. color'
                value={field.name}
                onChange={(e) => updateCustomField(index, { name: e.target.value })}
              />
              <Input
                className='pb-4'
                name={`custom-value-${index}`}
                label='Attribute Value'
                placeholder='e.g. red'
                value={field.value}
                onChange={(e) => updateCustomField(index, { value: e.target.value })}
              />
            </div>
          ))}

          <Button size='sm' variant='flat' onPress={addCustomField}>
            Add Attribute
          </Button>

          <div className='flex justify-end gap-2 mt-4'>
            <Button size='sm' variant='flat' color='danger' onPress={onClose}>
              Cancel
            </Button>
            <Button size='sm' type='submit' color='primary' isLoading={isPending}>
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}
