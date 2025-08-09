# Easy Build Components

React components library สำหรับ FormBuilder และ CrudTable ที่ใช้กับ Ant Design

## การติดตั้ง

```bash
npm install easy-build-components
```

## Peer Dependencies

ต้องติดตั้ง dependencies เหล่านี้ในโปรเจคของคุณ:

```bash
npm install react react-dom antd
```

## การใช้งาน

### FormBuilder Component

```javascript
import React from 'react';
import { FormBuilder } from 'easy-build-components';

const MyFormBuilder = () => {
  const handleSave = (formData) => {
    console.log('Form saved:', formData);
  };

  const handleFieldsChange = (fields) => {
    console.log('Fields changed:', fields);
  };

  return (
    <FormBuilder
      formTitle="Customer Registration Form"
      tableName="customers"
      onSave={handleSave}
      onFieldsChange={handleFieldsChange}
      showCodeGenerator={true}
      showPreview={true}
    />
  );
};

export default MyFormBuilder;
```

### CrudTable Component

```javascript
import React, { useState } from 'react';
import { CrudTable } from 'easy-build-components';

const MyDataTable = () => {
  const [data, setData] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 },
  ]);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      type: 'text',
      sortable: true,
      rules: [{ required: true, message: 'Please input name!' }]
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      type: 'email',
      sortable: true,
      rules: [
        { required: true, message: 'Please input email!' },
        { type: 'email', message: 'Please enter valid email!' }
      ]
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      type: 'number',
      sortable: true,
    }
  ];

  const filters = {
    fields: [
      {
        key: 'name',
        label: 'Name',
        type: 'input'
      },
      {
        key: 'age',
        label: 'Age Range',
        type: 'dateRange'
      }
    ],
    searchPlaceholder: 'Search users...'
  };

  const handleAdd = async (values) => {
    const newRecord = {
      id: Date.now(),
      ...values
    };
    setData([...data, newRecord]);
  };

  const handleEdit = async (key, values) => {
    setData(data.map(item =>
      item.id === key ? { ...item, ...values } : item
    ));
  };

  const handleDelete = async (keys) => {
    setData(data.filter(item => !keys.includes(item.id)));
  };

  return (
    <CrudTable
      title="User Management"
      data={data}
      columns={columns}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      filters={filters}
      rowKey="id"
      actions={{
        add: true,
        edit: true,
        delete: true,
        export: true
      }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true
      }}
    />
  );
};

export default MyDataTable;
```

## API Reference

### FormBuilder Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSave` | `(formData) => void` | - | Callback เมื่อบันทึกฟอร์ม |
| `onFieldsChange` | `(fields) => void` | - | Callback เมื่อฟิลด์เปลี่ยนแปลง |
| `initialFields` | `Array` | `[]` | ฟิลด์เริ่มต้น |
| `formTitle` | `string` | `'New Form'` | ชื่อฟอร์ม |
| `tableName` | `string` | - | ชื่อตาราง |
| `showCodeGenerator` | `boolean` | `true` | แสดงตัวสร้างโค้ด |
| `showPreview` | `boolean` | `true` | แสดงตัวอย่างฟอร์ม |
| `customFieldTypes` | `Array` | `[]` | ประเภทฟิลด์เพิ่มเติม |

### CrudTable Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Data Table'` | ชื่อตาราง |
| `data` | `Array` | `[]` | ข้อมูลในตาราง |
| `columns` | `Array` | `[]` | คอลัมน์ของตาราง |
| `onAdd` | `(values) => Promise<void>` | - | Callback เมื่อเพิ่มข้อมูล |
| `onEdit` | `(key, values) => Promise<void>` | - | Callback เมื่อแก้ไขข้อมูล |
| `onDelete` | `(keys) => Promise<void>` | - | Callback เมื่อลบข้อมูล |
| `onExport` | `(data) => void` | - | Callback เมื่อ export ข้อมูล |
| `loading` | `boolean` | `false` | สถานะ loading |
| `rowKey` | `string` | `'id'` | Key ของแถว |
| `filters` | `Object` | - | การตั้งค่าการกรอง |
| `pagination` | `Object` | - | การตั้งค่า pagination |
| `actions` | `Object` | `{add: true, edit: true, delete: true, export: true}` | การตั้งค่าปุ่มต่างๆ |
| `formLayout` | `string` | `'vertical'` | Layout ของฟอร์ม |
| `modalWidth` | `number` | `600` | ความกว้างของ Modal |

### Column Configuration

```javascript
{
  title: 'Column Title',
  dataIndex: 'field_name',
  key: 'unique_key',
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox',
  options: [{ label: 'Option 1', value: 'value1' }], // สำหรับ select
  width: 200,
  editable: true,
  sortable: true,
  filterable: true,
  render: (value, record, index) => ReactNode,
  rules: [{ required: true, message: 'Required!' }]
}
```

## Features

### FormBuilder
- ✅ Drag & Drop Field Types
- ✅ Field Configuration
- ✅ Live Preview
- ✅ Code Generation
- ✅ Custom Field Types
- ✅ Field Validation Rules
- ✅ Responsive Design

### CrudTable
- ✅ Create, Read, Update, Delete Operations
- ✅ Search & Filter
- ✅ Sorting
- ✅ Pagination
- ✅ Bulk Operations
- ✅ Export to CSV
- ✅ Custom Form Layouts
- ✅ Field Validation
- ✅ Responsive Design

## License

MIT

