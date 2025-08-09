'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Form,
  Input,
  Select,
  Switch,
  Typography,
  Space,
  Divider,
  Tag,
  Table,
  Modal,
  Tabs,
  Tooltip,
  Drawer,
  Row,
  Col,
  Empty,
  Radio,
  Segmented,
  Badge,
  Alert,
  message,
  DatePicker,
  Checkbox,
  InputNumber,
  App,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined,
  CodeOutlined,
  DownloadOutlined,
  FileTextOutlined,
  EditOutlined,
  SettingOutlined,
  UserOutlined,
  FormOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  BarsOutlined,
  CheckOutlined,
  LayoutOutlined,
  TableOutlined,
  ThunderboltOutlined,
  FileAddOutlined,
  MailOutlined,
  NumberOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  TagsOutlined,
  DownOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  QuestionCircleOutlined,
  DatabaseOutlined,
  ShoppingCartOutlined,
  LineChartOutlined,
  EyeOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '@/lib/api';
import dayjs from 'dayjs';
import CrudTable from '@/components/CrudTable';
import FieldOptionsTab from '@/components/FormBuilder/FieldOptionsTab';
import { useRouter } from 'next/navigation';
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const FormCodeGenerator = ({
  formFields,
  formSettings,
  formTitle,
  tableName,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const sanitizedTableName =
    tableName || formTitle?.toLowerCase().replace(/\s+/g, '_') || 'custom_form';

  // Function to generate the SQL CREATE TABLE statement
  const generateSqlCode = () => {
    // Map form field types to SQL column types
    const getColumnType = (fieldType) => {
      switch (fieldType) {
        case 'input':
          return 'VARCHAR(255)';
        case 'textArea':
          return 'TEXT';
        case 'email':
          return 'VARCHAR(255)';
        case 'number':
          return 'INT';
        case 'date':
          return 'DATE';
        case 'datetime':
          return 'DATETIME';
        case 'dateRange':
          return 'VARCHAR(255)';
        case 'radio':
          return 'VARCHAR(50)';
        case 'select':
          return 'VARCHAR(100)';
        case 'checkbox':
          return 'VARCHAR(255)';
        case 'tags':
          return 'JSON';
        case 'boolean':
          return 'TINYINT(1)';
        default:
          return 'VARCHAR(255)';
      }
    };

    // Generate the CREATE TABLE statement with columns
    let sql = `-- SQL CREATE TABLE statement for ${formTitle}\n`;
    sql += `CREATE TABLE \`${sanitizedTableName}\`
                (  `;
    sql += `  \`id\` INT AUTO_INCREMENT PRIMARY KEY,\n`;

    // Add columns for each form field
    formFields.forEach((field) => {
      // Get SQL column type
      const columnType = getColumnType(field.type);

      // Check if the field is required
      const isRequired = field.rules?.some((rule) => rule.required);
      const nullableStr = isRequired ? 'NOT NULL' : 'NULL';

      // Add the column definition
      sql += `  \`${field.dataIndex || field.name}\` ${columnType} ${nullableStr},\n`;
    });

    // Add created/updated timestamps
    sql += `  \`createdAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`;
    sql += `  \`updatedAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n`;
    sql += `);\n\n`;

    // Add sample INSERT statement
    sql += `-- Sample INSERT statement\n`;
    sql += `INSERT INTO \`${sanitizedTableName}\` (    `;
    sql += formFields
      .map((field) => `\`${field.dataIndex || field.name}\``)
      .join(',\n  ');
    sql += `\n) VALUES (\n  `;
    sql += formFields.map(() => '?').join(',\n  ');
    sql += `\n);\n`;

    return sql;
  };

  // Function to generate the route.js code
  const generateRouteCode = () => {
    return `import {getData, insertData, deleteData, updateData} from "@/lib/mysqldb";

const checkPayload = async (method, req) => {
    let body;
    if (method !== 'get') {
        body = await req.json();
    } else {
        const url = new URL(req.url);
        const params = url.searchParams
        body = Object.fromEntries(params.entries());
    }
    return body
}

/**
 * GET - Retrieve ${sanitizedTableName} data
 * Endpoint to fetch all ${sanitizedTableName} data
 */
export const GET = async (req) => {
    try {
        // Parse request parameters
        const params = await checkPayload('get', req);
        const {data} = await getData('${sanitizedTableName}', params);
        if (data) {
            return new Response(JSON.stringify({
                success: true,
                data: data,
                total: data.length,
            }), { status: 200 });
        } else {
            return new Response(JSON.stringify({
                success: false,
                message: 'No ${sanitizedTableName} data found'
            }), { status: 404 });
        }
    } catch (error) {
        console.error('❌ Error fetching ${sanitizedTableName} data:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Internal Server Error'
        }), { status: 500 });
    }
}

/**
 * POST - Create new ${sanitizedTableName} data
 * Endpoint to create a new ${sanitizedTableName} record
 */
export const POST = async (req) => {
    try {
        // Parse request body
        const params = await checkPayload('post', req);
        const data = await insertData('${sanitizedTableName}', params)
        console.log(data)
        if (data.status) {
            return new Response(JSON.stringify({
                success: true,
                message: '${formTitle} created successfully',
                data: {...params, id: data.id}
            }), { status: 201 });
        } else {
            return new Response(JSON.stringify({
                success: false,
                message: data.message || 'Failed to create ${formTitle}'
            ), { status: 400 });
        }
    } catch (error) {
        console.error('❌ Error creating ${formTitle}:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Internal Server Error'
        }), { status: 500 });
    }
}

/**
 * PUT - Update existing ${sanitizedTableName} data
 * Endpoint to update a ${sanitizedTableName} record by ID
 */
export const PUT = async (req) => {
    try {
        // Parse request body
        const {body, where} = await checkPayload('put', req);
        const data = await updateData('${sanitizedTableName}', body, where);
        console.log(data)
        
        if (data.status) {
            return new Response(JSON.stringify({
                success: true,
                message: '${formTitle} updated successfully',
                data: body
            }), { status: 200 });
        } else {
            return new Response(JSON.stringify({
                success: false,
                message: '${formTitle} not found'
            }), { status: 404 });
        }
    } catch (error) {
        console.error('❌ Error updating ${formTitle}:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Internal Server Error'
        }), { status: 500 });
    }
}

/**
 * DELETE - Remove ${sanitizedTableName} data
 * Endpoint to delete a ${sanitizedTableName} record by ID
 */
export const DELETE = async (req) => {
    try {
        const params = await checkPayload('delete', req);
        const data = await deleteData('${sanitizedTableName}', params)
        if (data.status) {
            return new Response(JSON.stringify({
                success: true,
                message: '${formTitle} deleted successfully',
            }), { status: 200 });
        } else {
            return new Response(JSON.stringify({
                success: false,
                message: '${formTitle} not found'
            }), { status: 404 });
        }
    } catch (error) {
        console.error('❌ Error deleting ${formTitle}:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Internal Server Error'
        }), { status: 500 });
    }
}`;
  };

  // Function to generate the page code
  const generatePageCode = () => {
    // Format field for columns config
    const formatColumns = (fields) => {
      return fields.map((field) => {
        let column = {
          title: field.title || field.label,
          dataIndex: field.dataIndex || field.name,
          key: field.dataIndex || field.name,
        };

        // Add special handlers for specific field types
        if (field.type === 'date' || field.type === 'datetime') {
          column.render = `(text) => { return dayjs(text).format('YYYY-MM-DD'); }`;
          column.sorter = true;
        }

        if (field.type === 'select' || field.type === 'radio') {
          column.filters = field.options?.map((opt) => ({
            text: opt.label,
            value: opt.value,
          }));
          column.onFilter = `(value, record) => record.${field.dataIndex || field.name} === value`;
        }

        return column;
      });
    };

    // Format field for form config
    const formatFormFields = (fields) => {
      return fields.map((field) => {
        let formField = {
          dataIndex: field.dataIndex || field.name,
          label: field.title || field.label, // Ensure label is included for form fields
          type: field.type,
          rules: (
            field.rules || [
              {
                required: true,
                message: `Please input ${field.title || field.label}!`,
              },
            ]
          ).map((r) => {
            if (r.pattern instanceof RegExp) {
              return { ...r, pattern: `__REGEXP_${r.pattern.source}__` };
            }
            return r;
          }),
        };

        if (field.options && field.options.length > 0) {
          formField.options = field.options;
        }
        if (field.optionsConfig?.mode === 'table') {
          formField.optionsConfig = {
            mode: 'table',
            table: field.optionsConfig.table,
            labelField: field.optionsConfig.labelField,
            valueField: field.optionsConfig.valueField,
          };
        }
        if (field.cardGroup) {
          formField.cardGroup = field.cardGroup;
        }

        return formField;
      });
    };

    // Generate component name based on table name
    const componentName = formTitle
      ?.replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^./, (str) => str.toUpperCase());

    // Create a copy of formSettings without cardGroupSetting for the main settings block
    const { cardGroupSetting, ...otherFormSettings } = formSettings || {};

    // Generate the page code
    return `'use client';
import React, {useEffect, useState} from 'react';
import {Card, message, Typography} from 'antd';
import CrudTable from '@/components/CrudTable';
import {useTitleContext} from "@/components/TitleContext";
import {DatabaseOutlined} from "@ant-design/icons";
import dayjs from 'dayjs';
import api from "@/lib/api";
const {Text} = Typography;

export default function ${componentName}() {
    useTitleContext({title: '${formTitle}', icon: <DatabaseOutlined/>});
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const options = {
            columns: ${JSON.stringify(formatColumns(formFields), null, 8)
              .replace(/"render": "(.*?)"/g, '"render": $1')
              .replace(/"onFilter": "(.*?)"/g, '"onFilter": $1')},
            form: {
                settings: {
                    title: '${otherFormSettings?.title || 'Form'} Form',
                    labelCol: {span: ${otherFormSettings?.labelCol?.span || 6}},
                    wrapperCol: {span: ${otherFormSettings?.wrapperCol?.span || 18}},
                    layout: '${otherFormSettings?.layout || 'horizontal'}',
                    gridColumns: ${otherFormSettings?.gridColumns || 1},
                    addModalTitle: '${otherFormSettings?.modalTitle || `Add New ${otherFormSettings?.title || 'Record'}`}',
                    editModalTitle: '${otherFormSettings?.modalTitle ? `Edit ${otherFormSettings.modalTitle}` : `Edit ${otherFormSettings?.title || 'Record'}`}',
                    modalWidth: '${otherFormSettings?.modalWidth || '80%'}',
                    initialValues: ${JSON.stringify(otherFormSettings?.initialValues || {}, null, 8)},
                    style: ${JSON.stringify(otherFormSettings?.style || {}, null, 8)}
                },
                fields: ${JSON.stringify(
                  formatFormFields(formFields),
                  null,
                  8
                ).replace(
                  /"__REGEXP_([^_]+)__"/g,
                  (_, p1) => `new RegExp(${JSON.stringify(p1)})`
                )},
                cardGroupSetting: ${JSON.stringify(cardGroupSetting || [], null, 8)}
            },
            filters: {
                fields: ${JSON.stringify(
                  formSettings.globalFilters?.map((f) => ({
                    title: f.title,
                    field: Array.isArray(f.field)
                      ? f.field
                      : f.field
                        ? [f.field]
                        : [],
                    type: f.type,
                    options: f.options || [],
                  })) || [],
                  null,
                  8
                )}
            },
            pagination: ${JSON.stringify(
              formSettings.paginationSettings || {
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                showQuickJumper: true,
              },
              null,
              8
            )}
        }
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.get('${sanitizedTableName}');
                console.log('API response:', response);
                if (response.data && response.data.length > 0) {
                    // If the API returns data with proper format
                    setData(response.data);
                } else {
                    // Keep the sample data if API doesn't return any data
                    console.log('No data from API');
                }
                setError(null);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to fetch data. Please try again later.');
                message.error('Failed to fetch data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    
    const handleAdd = (data, setData) => async (newRecord) => {
        try {
            const res = await api.post('${sanitizedTableName}', newRecord);
            setData([...data, res.data]);
            message.success(\`New record added successfully\`);
        } catch (error) {
            // Handle error response
            console.error('Error adding record:', error);
            if (error.response && error.response.data) {
                console.error('Error details:', error.response.data);
                message.error(\`Failed to add record: \${error.response.data.message}\`);
            }
            message.error('Failed to add record. Please try again.');
        }
    };
    
    const handleEdit = (data, setData) => async (key, updatedRecord) => {
        try {
            const newData = [...data];
            console.log('Editing record with key:', key);
            const index = newData.findIndex(item => item.id === key);
            if (index > -1) {
                await api.put(\`${sanitizedTableName}\`, {body: updatedRecord, where: { id: key }});
                newData[index] = {...newData[index], ...updatedRecord};
                setData(newData);
                message.success(\`Record updated successfully\`);
            }
        } catch (error) {
            console.error('Error updating record:', error);
            message.error('Failed to update record. Please try again.');
        }
    };
    
    const handleDelete = (data, setData) => async (keys) => {
        try {
            await Promise.all(keys.map(key => api.delete(\`${sanitizedTableName}\`, {id: key})));
            const newData = data.filter(item => !keys.includes(item.id));
            setData(newData);
            message.success(\`\${keys.length} record(s) deleted successfully\`);
        } catch (error) {
            console.error('Error deleting records:', error);
            message.error('Failed to delete records. Please try again.');
        }
    };
    
    const handleExport = () => (allData, selectedKeys) => {
        try {
            const dataToExport = selectedKeys.length > 0
                ? allData.filter(item => selectedKeys.includes(item.key))
                : allData;
            
            const headers = options.columns.map(col => col.title).join(',');
            const csvRows = dataToExport.map(item => {
                return options.columns.map(col => {
                    if (Array.isArray(item[col.dataIndex])) {
                        return \`"\${item[col.dataIndex].join(', ')}"\`;
                    } else if (col.dataIndex === 'createdAt' && item[col.dataIndex]) {
                        return dayjs(item[col.dataIndex]).format('YYYY-MM-DD');
                    }
                    return \`"\${item[col.dataIndex] || ''}"\`;
                }).join(',');
            });
            
            const csvString = [headers, ...csvRows].join('\\n');
            
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', \`${sanitizedTableName}-export-\${dayjs().format('YYYY-MM-DD')}.csv\`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            message.success(\`Exported \${dataToExport.length} records successfully\`);
        } catch (error) {
            console.error('Error exporting data:', error);
            message.error('Failed to export data. Please try again.');
        }
    };
    
    return (
        <Card className="p-4">
            {error && <div className="mb-4 text-red-500">{error}</div>}
            <CrudTable
                title="${formTitle}"
                data={data}
                setData={setData}
                onAdd={handleAdd(data, setData)}
                onEdit={handleEdit(data, setData)}
                onDelete={handleDelete(data, setData)}
                onExport={handleExport()}
                loading={loading}
                customColumns={options}
                rowkeys={['id']}
            />
        </Card>
    );
}`;
  };

  // Copy code to clipboard
  const copyToClipboard = (content) => {
    navigator.clipboard
      .writeText(content)
      .then(() => message.success('Code copied to clipboard!'))
      .catch(() => message.error('Failed to copy code.'));
  };

  // Download code
  const downloadCode = (content, filename) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  const handleSyncTable = async () => {
    try {
      const schema = {
        id: 'INT AUTO_INCREMENT PRIMARY KEY',
      };
      const getColumnType = (fieldType) => {
        switch (fieldType) {
          case 'input':
            return 'VARCHAR(255)';
          case 'textArea':
            return 'TEXT';
          case 'email':
            return 'VARCHAR(255)';
          case 'number':
            return 'INT';
          case 'date':
            return 'DATE';
          case 'datetime':
            return 'DATETIME';
          case 'dateRange':
            return 'VARCHAR(255)';
          case 'radio':
            return 'VARCHAR(50)';
          case 'select':
            return 'VARCHAR(100)';
          case 'checkbox':
            return 'VARCHAR(255)';
          case 'tags':
            return 'JSON';
          case 'boolean':
            return 'TINYINT(1)';
          default:
            return 'VARCHAR(255)';
        }
      };

      formFields.forEach((field) => {
        const columnType = getColumnType(field.type);
        const isRequired = field.rules?.some((rule) => rule.required);
        const nullableStr = isRequired ? 'NOT NULL' : 'NULL';
        schema[field.dataIndex || field.name] = `${columnType} ${nullableStr}`;
      });

      schema['createdAt'] = 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
      schema['updatedAt'] =
        'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP';

      const res = await api.post('create-table', {
        tableName: sanitizedTableName,
        schema,
      });
      if (res.success) {
        message.success(res.message || 'Table synced successfully');
      } else {
        message.error(res.message || 'Failed to sync table');
      }
    } catch (error) {
      console.error('Failed to sync table:', error);
      message.error('Failed to sync table');
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<CodeOutlined />}
        onClick={() => setIsModalVisible(true)}
      >
        Generate Code
      </Button>

      <Modal
        title="Generated Code"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        footer={null}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: '1',
              label: 'Page Code',
              children: (
                <Card>
                  <Space
                    style={{
                      marginBottom: 16,
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Button
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(generatePageCode())}
                    >
                      Copy
                    </Button>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() =>
                        downloadCode(
                          generatePageCode(),
                          `${sanitizedTableName}.page.js`
                        )
                      }
                    >
                      Download
                    </Button>
                  </Space>
                  <SyntaxHighlighter
                    language="javascript"
                    style={tomorrow}
                    showLineNumbers
                  >
                    {generatePageCode()}
                  </SyntaxHighlighter>
                </Card>
              ),
            },
            {
              key: '2',
              label: 'Route Code',
              children: (
                <Card>
                  <Space
                    style={{
                      marginBottom: 16,
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Button
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(generateRouteCode())}
                    >
                      Copy
                    </Button>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() =>
                        downloadCode(
                          generateRouteCode(),
                          `${sanitizedTableName}.route.js`
                        )
                      }
                    >
                      Download
                    </Button>
                  </Space>
                  <SyntaxHighlighter
                    language="javascript"
                    style={tomorrow}
                    showLineNumbers
                  >
                    {generateRouteCode()}
                  </SyntaxHighlighter>
                </Card>
              ),
            },
            {
              key: '3',
              label: 'Create Table Code',
              children: (
                <Card>
                  <Space
                    style={{
                      marginBottom: 16,
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Button
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(generateSqlCode())}
                    >
                      Copy
                    </Button>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() =>
                        downloadCode(
                          generateSqlCode(),
                          `${sanitizedTableName}.sql`
                        )
                      }
                    >
                      Download
                    </Button>
                    <Button
                      type="primary"
                      icon={<DatabaseOutlined />}
                      onClick={handleSyncTable}
                    >
                      Sync Table
                    </Button>
                  </Space>
                  <SyntaxHighlighter
                    language="sql"
                    style={tomorrow}
                    showLineNumbers
                  >
                    {generateSqlCode()}
                  </SyntaxHighlighter>
                </Card>
              ),
            },
          ]}
        />
      </Modal>
    </>
  );
};

const FormBuilder = () => {
  const [formTemplates, setFormTemplates] = useState([]);

  const [currentFieldFormTab, setCurrentFieldFormTab] = useState('basic');
  const [formFields, setFormFields] = useState([]);
  const [formSettings, setFormSettings] = useState({});
  const [fieldFormVisible, setFieldFormVisible] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const [form] = Form.useForm();
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [currentFieldType, setCurrentFieldType] = useState(null);
  const [currentSettingsTab, setCurrentSettingsTab] = useState('general'); // Moved here

  // Preview state
  const [previewData, setPreviewData] = useState([]);

  // Drag and drop state
  const [draggingFieldId, setDraggingFieldId] = useState(null);
  const [dragOverFieldId, setDragOverFieldId] = useState(null);

  const fetchTemplates = useCallback(
    async (selectId) => {
      try {
        const res = await api.get('form-designs');
        const dbTemplates = res?.data?.length
          ? res.data.map((t) => ({
              id: t.id?.toString() || t.name,
              name: t.name,
              icon: <FileAddOutlined />,
              description: t.description || '',
              fields: t.fields
                ? t.fields
                : t.fields_data
                  ? JSON.parse(t.fields_data)
                  : [],
              settings: t.settings
                ? t.settings
                : t.settings_data
                  ? JSON.parse(t.settings_data)
                  : {},
            }))
          : [];
        const combined = dbTemplates;
        setFormTemplates(combined);
        const target = combined.find(
          (t) => t.id === (selectId || selectedTemplate)
        );
        if (target) {
          setSelectedTemplate(target.id);
          setFormFields(JSON.parse(JSON.stringify(target.fields)));
          setFormSettings(JSON.parse(JSON.stringify(target.settings)));
        } else {
          setSelectedTemplate('');
          setFormFields([]);
          setFormSettings({});
        }
      } catch (err) {
        console.error('Failed to load templates from DB:', err);
        setFormTemplates([]);
      }
    },
    [selectedTemplate]
  );

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const computeCrudOptions = () => {
    const buildCrudColumns = (fields) => {
      return fields.map((field) => {
        let column = {
          title: field.title || field.label || field.name,
          dataIndex: field.dataIndex || field.name,
          key: field.dataIndex || field.name,
        };
        if (field.sortable) {
          column.sorter = true;
        }
        if (field.type === 'date' || field.type === 'datetime') {
          column.render = ` (text) => { return text ? dayjs(text).format('YYYY-MM-DD HH:mm') : ''; }`;
        }
        if (
          (field.type === 'select' || field.type === 'radio') &&
          field.options?.length > 0
        ) {
          column.filters = field.options.map((opt) => ({
            text: opt.label,
            value: opt.value,
          }));
          column.onFilter = ` (value, record) => record['${field.dataIndex || field.name}'] === value `;
        }
        return column;
      });
    };

    const buildCrudFormFields = (fields) => {
      return fields.map((field) => {
        let formField = {
          dataIndex: field.dataIndex || field.name,
          label: field.title || field.label || field.name,
          type: field.type,
          rules: field.rules || [
            {
              required: true,
              message: `Please input ${field.title || field.label || field.name}!`,
            },
          ],
        };
        if (field.options && field.options.length > 0) {
          formField.options = field.options;
        }
        if (field.optionsConfig?.mode === 'table') {
          formField.optionsConfig = {
            mode: 'table',
            table: field.optionsConfig.table,
            labelField: field.optionsConfig.labelField,
            valueField: field.optionsConfig.valueField,
          };
        }
        if (field.cardGroup) {
          formField.cardGroup = field.cardGroup;
        }
        // Include other relevant properties from field if CrudTable's getFormItems uses them
        // For example: rows, format, checkboxLabel, disabled
        if (field.rows) formField.rows = field.rows;
        if (field.format) formField.format = field.format;
        if (field.checkboxLabel) formField.checkboxLabel = field.checkboxLabel;
        // 'disabled' is often a function (modalMode) => ..., which can't be directly stringified for all cases.
        // If 'disabled' is a simple boolean in formFields, it can be included.
        if (typeof field.disabled === 'boolean') {
          formField.disabled = field.disabled;
        }
        return formField;
      });
    };

    const {
      cardGroupSetting,
      globalFilters,
      paginationSettings,
      ...otherSettings
    } = formSettings || {};

    return {
      columns: buildCrudColumns(formFields),
      form: {
        settings: {
          title: otherSettings?.title
            ? `${otherSettings.title} Form`
            : 'Generated Form',
          labelCol: otherSettings?.labelCol || { span: 6 },
          wrapperCol: otherSettings?.wrapperCol || { span: 18 },
          layout: otherSettings?.layout || 'horizontal',
          gridColumns: otherSettings?.gridColumns || 1,
          addModalTitle:
            otherSettings?.modalTitle ||
            `Add New ${otherSettings?.title || 'Record'}`,
          editModalTitle: otherSettings?.modalTitle
            ? `Edit ${otherSettings.modalTitle}`
            : `Edit ${otherSettings?.title || 'Record'}`,
          modalWidth: otherSettings?.modalWidth || '80%',
          initialValues: otherSettings?.initialValues || {},
          style: otherSettings?.style || {},
        },
        fields: buildCrudFormFields(formFields),
        cardGroupSetting: cardGroupSetting || [],
      },
      filters: {
        fields:
          globalFilters?.map((f) => ({
            title: f.title,
            field: Array.isArray(f.field) ? f.field : f.field ? [f.field] : [],
            type: f.type,
            options: f.options || [],
          })) || [],
      },
      pagination: paginationSettings || {
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showQuickJumper: true,
      },
    };
  };
  const handleViewPage = (templateName) => {
    if (!templateName) return;
    // Convert template name to URL format (lowercase with underscores)
    const urlPath = templateName.toLowerCase().replace(/\s+/g, '_');
    router.push(`/${urlPath}`);
  };

  // Handle template selection
  const handleTemplateSelect = (templateId) => {
    try {
      // Find the selected template
      const template = formTemplates.find((t) => t.id === templateId);

      if (!template) {
        message.error('Invalid template selected');
        return;
      }

      // Confirm before changing if there are existing fields
      if (formFields.length > 0) {
        Modal.confirm({
          title: 'Change Template?',
          content:
            'Changing template will replace your current form fields. Continue?',
          onOk() {
            // Update selected template
            setSelectedTemplate(templateId);

            // Update form fields and settings with deep cloning to avoid circular references
            setFormFields(JSON.parse(JSON.stringify(template.fields)));
            setFormSettings(JSON.parse(JSON.stringify(template.settings)));

            message.success(`Template changed to ${template.name}`);
          },
          okButtonProps: {
            //    type: 'primary' ,
            style: { background: '#006964' },
          },
        });
      } else {
        // If no fields exist, just change the template
        setSelectedTemplate(templateId);
        setFormFields(JSON.parse(JSON.stringify(template.fields)));
        setFormSettings(JSON.parse(JSON.stringify(template.settings)));

        message.success(`Template changed to ${template.name}`);
      }
    } catch (error) {
      console.error('Error selecting template:', error);
      message.error('Failed to change template');
    }
  };

  const handleDeleteTemplate = (templateId) => {
    Modal.confirm({
      title: 'Delete Template?',
      content: 'This will permanently remove the template.',
      onOk: async () => {
        try {
          const res = await api.delete('form-designs', { id: templateId });
          if (res && res.success) {
            message.success(res.message || 'Template deleted');
            await fetchTemplates();
          } else {
            message.error(res?.message || 'Failed to delete template');
          }
        } catch (err) {
          console.error('Error deleting template:', err);
          message.error('Failed to delete template');
        }
      },
    });
  };

  // Field type options
  const fieldTypes = [
    { label: 'Text Input', value: 'input', icon: <FormOutlined /> },
    { label: 'Email', value: 'email', icon: <MailOutlined /> },
    { label: 'Text Area', value: 'textArea', icon: <FileTextOutlined /> },
    { label: 'Number', value: 'number', icon: <NumberOutlined /> },
    { label: 'Select', value: 'select', icon: <DownOutlined /> },
    { label: 'Date Picker', value: 'date', icon: <CalendarOutlined /> },
    { label: 'Date Range', value: 'dateRange', icon: <CalendarOutlined /> },
    { label: 'Checkbox', value: 'checkbox', icon: <CheckSquareOutlined /> },
    { label: 'Radio', value: 'radio', icon: <CheckCircleOutlined /> },
    { label: 'Tags', value: 'tags', icon: <TagsOutlined /> },
  ];

  // Common field presets for quick addition
  const fieldPresets = [
    {
      name: 'Name',
      dataIndex: 'name',
      title: 'Name',
      type: 'input',
      rules: [{ required: true, message: 'Please input name!' }],
      sortable: true,
      icon: <UserOutlined />,
    },
    {
      name: 'Email Address',
      dataIndex: 'email',
      title: 'Email',
      type: 'email',
      rules: [
        { required: true, message: 'Please input email!' },
        { type: 'email', message: 'Please enter a valid email!' },
      ],
      sortable: true,
      icon: <MailOutlined />,
    },
    {
      name: 'Phone Number',
      dataIndex: 'phone',
      title: 'Phone',
      type: 'input',
      rules: [{ required: false, message: 'Please input phone number!' }],
      sortable: true,
      icon: <PhoneOutlined />,
    },
    {
      name: 'Status',
      dataIndex: 'status',
      title: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Pending', value: 'pending' },
      ],
      rules: [{ required: true, message: 'Please select status!' }],
      sortable: true,
      icon: <CheckCircleOutlined />,
    },
    {
      name: 'Date Created',
      dataIndex: 'dateCreated',
      title: 'Date Created',
      type: 'date',
      rules: [],
      sortable: true,
      icon: <CalendarOutlined />,
    },
    {
      name: 'Description',
      dataIndex: 'description',
      title: 'Description',
      type: 'textArea',
      rules: [],
      sortable: false,
      icon: <FileTextOutlined />,
    },
  ];

  // Add a new field
  const handleAddField = () => {
    try {
      // Create a field with explicit properties to avoid circular references
      const newField = {
        id: uuidv4(),
        dataIndex: '',
        title: '',
        type: 'input',
        rules: [],
        options: [],
        optionsConfig: { mode: 'manual' },
        sortable: true,
      };

      // Use a deep copy to break any potential references
      setCurrentField(JSON.parse(JSON.stringify(newField)));
      form.resetFields();
      setFieldFormVisible(true);
    } catch (error) {
      console.error('Error initializing new field:', error);
      message.error('Failed to initialize new field');
    }
  };

  // Add a preset field
  const handleAddPresetField = (preset) => {
    try {
      // Create a new object without potential circular references
      // by explicitly picking only the properties we need
      const sanitizedPreset = {
        name: preset.name,
        dataIndex: preset.dataIndex,
        title: preset.title,
        type: preset.type,
        rules: Array.isArray(preset.rules) ? [...preset.rules] : [],
        options: Array.isArray(preset.options) ? [...preset.options] : [],
        sortable: Boolean(preset.sortable),
      };

      const newField = {
        id: uuidv4(),
        ...sanitizedPreset,
      };

      // Use functional updates to ensure we're using latest state
      setFormFields((prevFields) => {
        // Create a safe copy of the fields first
        const safeFields = JSON.parse(JSON.stringify(prevFields));

        // Check for duplicate data indexes
        const baseDataIndex = newField.dataIndex;
        let dataIndex = baseDataIndex;
        let counter = 1;

        // If the field name already exists, add a number to make it unique
        while (safeFields.some((f) => f.dataIndex === dataIndex)) {
          dataIndex = `${baseDataIndex}${counter}`;
          counter++;
        }

        newField.dataIndex = dataIndex;

        message.success(`"${newField.title}" field added`);
        return [...safeFields, newField];
      });
    } catch (error) {
      console.error('Error adding preset field:', error);
      message.error('Failed to add preset field');
    }
  };

  // Edit an existing field
  const handleEditField = (field) => {
    try {
      if (!field || !field.id) {
        message.error('Invalid field selected for editing');
        return;
      }

      // Create a proper deep copy to avoid reference issues
      const fieldCopy = JSON.parse(JSON.stringify(field));
      setCurrentField(fieldCopy);

      const formValues = {
        dataIndex: fieldCopy.dataIndex,
        title: fieldCopy.title,
        type: fieldCopy.type,
        required: fieldCopy.rules?.some((rule) => rule.required) || false,
        requiredMessage: fieldCopy.rules?.find((rule) => rule.required)
          ?.message,
        emailMessage: fieldCopy.rules?.find((rule) => rule.type === 'email')
          ?.message,
        pattern: (() => {
          const rule = fieldCopy.rules?.find((r) => r.pattern);
          if (rule && rule.pattern instanceof RegExp) {
            return rule.pattern.source;
          }
          return undefined;
        })(),
        patternMessage: fieldCopy.rules?.find((r) => r.pattern)?.message,
        sortable: fieldCopy.sortable || false,
        cardGroup: fieldCopy.cardGroup || null,
        options: [],
        optionsConfig: { mode: 'manual' },
      };

      if (fieldCopy.optionsConfig) {
        formValues.optionsConfig = fieldCopy.optionsConfig;
        if (Array.isArray(fieldCopy.options)) {
          formValues.options = fieldCopy.options;
        }
      } else if (Array.isArray(fieldCopy.options)) {
        // Cannot distinguish between manual and JSON, so default to manual.
        // This preserves the data, and it remains editable.
        formValues.options = fieldCopy.options;
        formValues.optionsConfig = {
          mode: 'manual',
          // Pre-fill JSON field in case user wants to switch to it.
          json: JSON.stringify(fieldCopy.options, null, 2),
        };
      }

      // Set form values
      form.setFieldsValue(formValues);

      setFieldFormVisible(true);
    } catch (error) {
      console.error('Error editing field:', error);
      message.error('Failed to edit field');
    }
  };

  // Save field from form
  const handleSaveField = async () => {
    try {
      // Validate all form fields
      const values = await form.validateFields();

      if (!currentField || !currentField.id) {
        message.error('Missing field information');
        return;
      }

      // Create a clean field object with only the properties we need
      const fieldToSave = {
        id: currentField.id,
        dataIndex: values.dataIndex.trim(),
        title: values.title.trim(),
        type: values.type,
        rules: [],
        sortable: Boolean(values.sortable),
        cardGroup: values.cardGroup,
      };

      if (values.required) {
        fieldToSave.rules.push({
          required: true,
          message:
            values.requiredMessage?.trim() ||
            `Please input ${values.title.trim()}!`,
        });
      }
      if (values.type === 'email') {
        fieldToSave.rules.push({
          type: 'email',
          message: values.emailMessage?.trim() || 'Please enter a valid email!',
        });
      }
      if (values.pattern) {
        try {
          const regex = new RegExp(values.pattern);
          fieldToSave.rules.push({
            pattern: regex,
            message: values.patternMessage?.trim() || 'Invalid format.',
          });
        } catch (err) {
          message.error('Invalid regular expression pattern');
        }
      }

      const optionsConfig = values.optionsConfig || { mode: 'manual' };

      // Clear old option-related fields before setting new ones
      delete fieldToSave.options;
      delete fieldToSave.optionsConfig;

      fieldToSave.optionsConfig = optionsConfig;

      if (optionsConfig.mode === 'table') {
        if (Array.isArray(values.options) && values.options.length > 0) {
          fieldToSave.options = values.options;
        }
      } else if (optionsConfig.mode === 'json') {
        try {
          fieldToSave.options = JSON.parse(optionsConfig.json || '[]');
        } catch (e) {
          message.error('Invalid JSON format for options.');
          fieldToSave.options = [];
        }
      } else {
        // 'manual'
        fieldToSave.options = Array.isArray(values.options)
          ? values.options
          : [];
      }

      // Use functional updates to ensure we're using latest state
      setFormFields((prevFields) => {
        try {
          // Create a safe copy of previous fields to avoid circular references
          const safeFields = JSON.parse(JSON.stringify(prevFields));

          const existingField = safeFields.some(
            (f) => f.id === currentField.id
          );

          if (existingField) {
            // Update existing field
            message.success(
              `Field "${fieldToSave.title}" updated successfully`
            );
            return safeFields.map((f) =>
              f.id === currentField.id ? fieldToSave : f
            );
          } else {
            // Add new field
            message.success(`Field "${fieldToSave.title}" added successfully`);
            return [...safeFields, fieldToSave];
          }
        } catch (err) {
          console.error('Error updating fields:', err);
          message.error('An error occurred while saving the field');
          return prevFields; // Return unchanged if there's an error
        }
      });

      setFieldFormVisible(false);
    } catch (error) {
      console.error('Validation failed:', error);
      message.error('Please check form fields and try again');
    }
  };

  // Delete a field
  const handleDeleteField = (fieldId) => {
    try {
      if (!fieldId) {
        message.error('Invalid field selected for deletion');
        return;
      }

      // Find the field to show in success message
      const fieldToDelete = formFields.find((field) => field.id === fieldId);

      // Use functional update to ensure we're working with latest state
      setFormFields((prevFields) => {
        // Remove field
        const updatedFields = prevFields.filter(
          (field) => field.id !== fieldId
        );
        // Show success message
        if (fieldToDelete) {
          message.success(
            `Field "${fieldToDelete.title}" removed successfully`
          );
        }
        return updatedFields;
      });
    } catch (error) {
      console.error('Error deleting field:', error);
      message.error('Failed to delete field');
    }
  };

  // Component to render visual example of a field type
  const FieldTypeExample = ({ type }) => {
    // Sample data and components for each field type
    const examples = {
      input: <Input placeholder="Type here..." />,
      email: <Input placeholder="user@example.com" prefix={<MailOutlined />} />,
      textArea: <TextArea placeholder="Enter description..." rows={2} />,
      number: <InputNumber placeholder="0" min={0} />,
      select: (
        <Select
          placeholder="Select an option"
          options={[
            { label: 'Option 1', value: '1' },
            { label: 'Option 2', value: '2' },
          ]}
        />
      ),
      date: <DatePicker style={{ width: '100%' }} />,
      dateRange: <DatePicker.RangePicker style={{ width: '100%' }} />,
      checkbox: <Checkbox.Group options={['Option 1', 'Option 2']} />,
      radio: (
        <Radio.Group>
          <Radio value="1">Option 1</Radio>
          <Radio value="2">Option 2</Radio>
        </Radio.Group>
      ),
      tags: (
        <Select
          mode="tags"
          placeholder="Select or add tags"
          options={[
            { label: 'Tag 1', value: 'tag1' },
            { label: 'Tag 2', value: 'tag2' },
          ]}
          style={{ width: '100%' }}
        />
      ),
    };

    return (
      examples[type] || <Input disabled placeholder="Select a field type" />
    );
  };

  // Field type selection with visual examples
  const renderFieldTypeSelection = () => {
    const selectedType = form.getFieldValue('type') || 'input';

    const handleTypeSelect = (type) => {
      form.setFieldValue('type', type);
      setCurrentFieldType(type); // Update the current field type state to trigger re-render

      // Reset options if switching to a type that doesn't use them
      if (!['select', 'radio', 'tags', 'checkbox'].includes(type)) {
        form.setFieldValue('options', []);
      }

      // If switching to a type that uses options but none exist, add default ones
      if (
        ['select', 'radio', 'tags', 'checkbox'].includes(type) &&
        (!form.getFieldValue('options') ||
          form.getFieldValue('options').length === 0)
      ) {
        form.setFieldValue('options', [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
        ]);
      }
    };

    const typeDescriptions = {
      input: 'Standard text input for single-line text',
      email: 'Email input with validation',
      textArea: 'Multi-line text input for longer content',
      number: 'Numeric input with increment/decrement controls',
      select: 'Dropdown selection from predefined options',
      date: 'Date picker with calendar popup',
      dateRange: 'Date range selection with calendar popup',
      checkbox: 'Multiple selection checkboxes',
      radio: 'Single selection radio buttons',
      tags: 'Multiple tags with ability to add custom values',
    };

    return (
      <>
        <div style={{ marginBottom: 16 }}>
          <Text strong>Select Field Type</Text>
          <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
            Choose how users will input data for this field
          </Text>
        </div>

        <Row gutter={[16, 16]}>
          {fieldTypes.map((type) => (
            <Col span={8} key={type.value}>
              <Card
                hoverable
                size="small"
                className={selectedType === type.value ? 'selected-type' : ''}
                onClick={() => handleTypeSelect(type.value)}
                style={{
                  cursor: 'pointer',
                  borderColor:
                    selectedType === type.value ? '#0F79BC' : '#f0f0f0',
                  // background: selectedType === type.value ? '#e6f7ff' : '#fff'
                }}
                title={
                  <Space>
                    {type.icon}
                    <Text strong>{type.label}</Text>
                  </Space>
                }
                extra={
                  selectedType === type.value && (
                    <CheckOutlined style={{ color: '#0F79BC' }} />
                  )
                }
              >
                <Tooltip title={typeDescriptions[type.value]}>
                  <div style={{ minHeight: 60 }}>
                    <FieldTypeExample type={type.value} />
                  </div>
                </Tooltip>
              </Card>
            </Col>
          ))}
        </Row>
      </>
    );
  };

  // Live field preview based on current settings
  const renderFieldPreview = () => {
    const fieldValues = form.getFieldsValue();
    const { title, type, required } = fieldValues;
    const displayTitle = title || 'Field Label';

    return (
      <Card
        title="Live Preview"
        size="small"
        style={{ marginTop: 24, marginBottom: 24 }}
        extra={<InfoCircleOutlined />}
      >
        <Form form={form} layout={formSettings.layout}>
          <Form.Item
            label={displayTitle}
            required={required}
            tooltip={
              required ? 'This field is required' : 'This field is optional'
            }
          >
            <FieldTypeExample type={type} />
          </Form.Item>
        </Form>
      </Card>
    );
  };

  // State for field form tabs

  // Check if the current field type needs options
  const checkNeedsOptions = () => {
    const currentType = form?.getFieldValue('type');
    return ['select', 'radio', 'tags', 'checkbox'].includes(currentType);
  };

  // Effect to update tab notification when field type changes - moved outside renderFieldForm
  useEffect(() => {
    // Skip if form is not available
    if (!form) return;

    const fieldType = form.getFieldValue('type');
    const needsOptions = ['select', 'radio', 'tags', 'checkbox'].includes(
      fieldType
    );
    const options = form.getFieldValue('options') || [];

    if (needsOptions && options.length === 0 && fieldFormVisible) {
      message.info(
        'This field type requires options. Please add them in the Options tab.'
      );
    }
  }, [fieldFormVisible, form, message]);

  // Function to handle saving the form design
  const handleSaveDesign = async () => {
    // Helper to build columns for CrudTable options
    const buildCrudColumns = (fields) => {
      return fields.map((field) => {
        let column = {
          title: field.title || field.label || field.name,
          dataIndex: field.dataIndex || field.name,
          key: field.dataIndex || field.name,
        };
        if (field.sortable) {
          column.sorter = true; // For antd's basic sort. Generated page.js might have specific functions.
        }
        if (field.type === 'date' || field.type === 'datetime') {
          column.render = ` (text) => { return text ? dayjs(text).format('YYYY-MM-DD HH:mm') : ''; }`;
        }
        if (field.type === 'select' || field.type === 'radio') {
          if (field.options && field.options.length > 0) {
            column.filters = field.options.map((opt) => ({
              text: opt.label,
              value: opt.value,
            }));
            column.onFilter = ` (value, record) => record['${field.dataIndex || field.name}'] === value `;
          }
        }
        return column;
      });
    };

    // Helper to build form fields for CrudTable options
    const buildCrudFormFields = (fields) => {
      return fields.map((field) => {
        let formField = {
          dataIndex: field.dataIndex || field.name,
          label: field.title || field.label || field.name,
          type: field.type,
          rules: field.rules || [
            {
              required: true,
              message: `Please input ${field.title || field.label || field.name}!`,
            },
          ],
        };
        if (field.options && field.options.length > 0) {
          formField.options = field.options;
        }
        if (field.optionsConfig?.mode === 'table') {
          formField.optionsConfig = field.optionsConfig;
        }
        if (field.cardGroup) {
          formField.cardGroup = field.cardGroup;
        }
        // Include other relevant properties from field if CrudTable's getFormItems uses them
        // For example: rows, format, checkboxLabel, disabled
        if (field.rows) formField.rows = field.rows;
        if (field.format) formField.format = field.format;
        if (field.checkboxLabel) formField.checkboxLabel = field.checkboxLabel;
        // 'disabled' is often a function (modalMode) => ..., which can't be directly stringified for all cases.
        // If 'disabled' is a simple boolean in formFields, it can be included.
        if (typeof field.disabled === 'boolean') {
          formField.disabled = field.disabled;
        }
        return formField;
      });
    };

    const {
      cardGroupSetting,
      globalFilters,
      paginationSettings,
      ...otherSettings
    } = formSettings || {};

    const crudTableOptions = {
      columns: buildCrudColumns(formFields),
      form: {
        settings: {
          title: otherSettings?.title
            ? `${otherSettings.title} Form`
            : 'Generated Form',
          labelCol: otherSettings?.labelCol || { span: 6 },
          wrapperCol: otherSettings?.wrapperCol || { span: 18 },
          layout: otherSettings?.layout || 'horizontal',
          gridColumns: otherSettings?.gridColumns || 1,
          addModalTitle:
            otherSettings?.modalTitle ||
            `Add New ${otherSettings?.title || 'Record'}`,
          editModalTitle: otherSettings?.modalTitle
            ? `Edit ${otherSettings.modalTitle}`
            : `Edit ${otherSettings?.title || 'Record'}`,
          modalWidth: otherSettings?.modalWidth || '80%',
          initialValues: otherSettings?.initialValues || {},
          style: otherSettings?.style || {},
        },
        fields: buildCrudFormFields(formFields),
        cardGroupSetting: cardGroupSetting || [],
      },
      filters: {
        fields:
          globalFilters?.map((f) => ({
            title: f.title,
            field: Array.isArray(f.field) ? f.field : f.field ? [f.field] : [],
            type: f.type,
            options: f.options || [],
          })) || [],
      },
      pagination: paginationSettings || {
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showQuickJumper: true,
      },
    };

    const formDesignPayload = {
      name: formSettings.title || 'Untitled Form Design',
      fields_data: formFields,
      settings_data: formSettings,
      crud_options_data: crudTableOptions,
      table: (formSettings.title || 'form_designs')
        .toLowerCase()
        .replace(/\s+/g, '_'),
    };
    console.log('Payload to save:', formDesignPayload);

    try {
      let response;
      if (selectedTemplate && !isNaN(Number(selectedTemplate))) {
        response = await api.put('form-designs', {
          body: formDesignPayload,
          where: { id: Number(selectedTemplate) },
        });
      } else {
        response = await api.post('form-designs', formDesignPayload);
      }

      if (response && response.success) {
        message.success(response.message || 'Form design saved successfully!');
        const newId = response.data?.id || selectedTemplate;
        await fetchTemplates(newId.toString());
      } else {
        message.error(
          response?.message || 'Failed to save form design. Unknown error.'
        );
      }
    } catch (error) {
      console.error('Error saving form design:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An error occurred while saving the form design.';
      message.error(errorMessage);
    }
  };

  // Field form for add/edit
  const renderFieldForm = () => {
    return (
      <Drawer
        title={currentField?.id ? 'Edit Field' : 'Add Field'}
        open={fieldFormVisible}
        onClose={() => setFieldFormVisible(false)}
        width={700}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button
              onClick={() => setFieldFormVisible(false)}
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveField} type="primary">
              Save
            </Button>
          </div>
        }
      >
        <Form
          form={form} // Pass the form instance here
          layout="vertical"
          initialValues={{
            type: 'input',
            required: true,
            requiredMessage: '',
            emailMessage: '',
            pattern: '',
            patternMessage: '',
            sortable: true,
            options: [],
          }}
        >
          <Tabs
            activeKey={currentFieldFormTab}
            onChange={setCurrentFieldFormTab}
            items={[
              {
                key: 'basic',
                label: (
                  <span>
                    <FormOutlined /> Basic Info
                  </span>
                ),
                children: (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="dataIndex"
                          label="Field Name (dataIndex)"
                          rules={[
                            {
                              required: true,
                              message: 'Please input field name!',
                            },
                            {
                              pattern: /^[a-zA-Z0-9_]+$/,
                              message:
                                'Field name can only contain letters, numbers and underscore',
                            },
                            {
                              min: 2,
                              message:
                                'Field name must be at least 2 characters',
                            },
                          ]}
                          tooltip="This will be used as the data index in code. Use camelCase naming (e.g. userName)"
                        >
                          <Input
                            placeholder="e.g. username, email, status"
                            suffix={<QuestionCircleOutlined />}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="title"
                          label="Display Title"
                          rules={[
                            {
                              required: true,
                              message: 'Please input display title!',
                            },
                            {
                              min: 2,
                              message: 'Title must be at least 2 characters',
                            },
                          ]}
                          tooltip="This will be shown as column header and form label"
                        >
                          <Input
                            placeholder="e.g. Username, Email, Status"
                            suffix={<QuestionCircleOutlined />}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item name="type" hidden>
                      <Input />
                    </Form.Item>

                    <Form.Item
                      name="cardGroup"
                      label="Card Group (Optional)"
                      tooltip="Assign this field to a specific card group in the form."
                    >
                      <Select placeholder="Select card group" allowClear>
                        {(formSettings.cardGroupSetting || []).map((group) => (
                          <Select.Option key={group.key} value={group.key}>
                            {group.title || group.key}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    {renderFieldTypeSelection()}
                    {renderFieldPreview()}
                  </>
                ),
              },
              {
                key: 'options',
                label: (
                  <span>
                    <SettingOutlined /> Options
                    {checkNeedsOptions() &&
                      form.getFieldValue('options')?.length === 0 && (
                        <Badge
                          count="!"
                          style={{ backgroundColor: '#faad14', marginLeft: 5 }}
                        />
                      )}
                  </span>
                ),
                children: (
                  <FieldOptionsTab
                    form={form}
                    setCurrentFieldFormTab={setCurrentFieldFormTab}
                  />
                ),
              },
              {
                key: 'settings',
                label: (
                  <span>
                    <CheckSquareOutlined /> Settings
                  </span>
                ),
                children: (
                  <>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          name="required"
                          valuePropName="checked"
                          label="Required"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name="sortable"
                          valuePropName="checked"
                          label="Sortable"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, curr) =>
                        prev.required !== curr.required ||
                        prev.title !== curr.title
                      }
                    >
                      {() =>
                        form.getFieldValue('required') ? (
                          <Form.Item
                            name="requiredMessage"
                            label="Required Message"
                          >
                            <Input
                              placeholder={`Please input ${form.getFieldValue('title') || 'value'}!`}
                            />
                          </Form.Item>
                        ) : null
                      }
                    </Form.Item>
                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, curr) => prev.type !== curr.type}
                    >
                      {() =>
                        form.getFieldValue('type') === 'email' ? (
                          <Form.Item
                            name="emailMessage"
                            label="Invalid Email Message"
                          >
                            <Input placeholder="Please enter a valid email!" />
                          </Form.Item>
                        ) : null
                      }
                    </Form.Item>
                    <Form.Item name="pattern" label="Pattern (RegExp)">
                      <Input placeholder="e.g. ^[0-9]+$" />
                    </Form.Item>
                    <Form.Item name="patternMessage" label="Pattern Message">
                      <Input placeholder="Invalid format" />
                    </Form.Item>
                  </>
                ),
              },
            ]}
          />
        </Form>
      </Drawer>
    );
  };

  // Duplicate a field
  const handleDuplicateField = (field) => {
    try {
      if (!field || !field.id) {
        message.error('Invalid field selected for duplication');
        return;
      }

      // Create a deep copy of the field
      const fieldCopy = JSON.parse(JSON.stringify(field));

      // Create a new field based on the copied one
      const newField = {
        ...fieldCopy,
        id: uuidv4(), // New unique ID
      };

      // Use functional updates to ensure we're using latest state
      setFormFields((prevFields) => {
        // Create a safe copy of the fields first
        const safeFields = JSON.parse(JSON.stringify(prevFields));

        // Check for duplicate data indexes
        const baseDataIndex = newField.dataIndex;
        let dataIndex = `${baseDataIndex}Copy`;
        let counter = 1;

        // If the field name already exists, add a number to make it unique
        while (safeFields.some((f) => f.dataIndex === dataIndex)) {
          dataIndex = `${baseDataIndex}Copy${counter}`;
          counter++;
        }

        newField.dataIndex = dataIndex;
        newField.title = `${newField.title} (Copy)`;

        message.success(`Field "${field.title}" duplicated`);
        return [...safeFields, newField];
      });
    } catch (error) {
      console.error('Error duplicating field:', error);
      message.error('Failed to duplicate field');
    }
  };

  const handleUpdateFieldCardGroup = useCallback((fieldId, groupKey) => {
    setFormFields((prevFields) =>
      prevFields.map((f) =>
        f.id === fieldId ? { ...f, cardGroup: groupKey || null } : f
      )
    );
  }, []);

  // Drag and drop handlers
  const handleDragStart = (id) => {
    setDraggingFieldId(id);
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (id !== dragOverFieldId) {
      setDragOverFieldId(id);
    }
  };

  const handleDrop = (id) => {
    if (draggingFieldId === null || id === draggingFieldId) return;
    setFormFields((prev) => {
      const newFields = [...prev];
      const from = newFields.findIndex((f) => f.id === draggingFieldId);
      const to = newFields.findIndex((f) => f.id === id);
      const [item] = newFields.splice(from, 1);
      newFields.splice(to, 0, item);
      return newFields;
    });
    setDraggingFieldId(null);
    setDragOverFieldId(null);
  };

  const handleDragEnd = () => {
    setDraggingFieldId(null);
    setDragOverFieldId(null);
  };

  // Field list table
  const renderFieldsTable = () => {
    const columns = [
      {
        title: '',
        dataIndex: 'sort',
        width: 40,
        render: () => <MenuOutlined className="drag-handle" />,
      },
      {
        title: 'Field Name',
        dataIndex: 'dataIndex',
        key: 'dataIndex',
      },
      {
        title: 'Display Title',
        dataIndex: 'title',
        key: 'title',
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (type) => {
          const typeInfo = fieldTypes.find((t) => t.value === type);
          return typeInfo ? typeInfo.label : type;
        },
      },
      {
        title: 'Required',
        dataIndex: 'rules',
        key: 'required',
        render: (rules) =>
          rules?.some((rule) => rule.required) ? 'Yes' : 'No',
      },
      {
        title: 'Options',
        dataIndex: 'options',
        key: 'options',
        render: (options, record) => {
          if (
            record.optionsConfig?.mode === 'table' &&
            record.optionsConfig.table
          ) {
            return <Tag color="#722ed1">{record.optionsConfig.table}</Tag>;
          }
          return options?.length > 0 ? (
            <Tooltip
              title={options.map((o) => `${o.label} (${o.value})`).join(', ')}
            >
              <Tag color="#0F79BC">{options.length} options</Tag>
            </Tooltip>
          ) : null;
        },
      },
      {
        title: 'Card Group',
        dataIndex: 'cardGroup',
        key: 'cardGroup',
        render: (cardGroup, record) => (
          <Select
            value={cardGroup}
            allowClear
            style={{ width: 150 }}
            placeholder="None"
            onChange={(val) => handleUpdateFieldCardGroup(record.id, val)}
            options={(formSettings.cardGroupSetting || []).map((g) => ({
              label: g.title || g.key,
              value: g.key,
            }))}
          />
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditField(record)}
              title="Edit Field"
            />
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleDuplicateField(record)}
              title="Duplicate Field"
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteField(record.id)}
              title="Delete Field"
            />
          </Space>
        ),
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={formFields}
        rowKey="id"
        pagination={false}
        size="small"
        onRow={(record) => ({
          draggable: true,
          onDragStart: () => handleDragStart(record.id),
          onDragOver: (e) => handleDragOver(e, record.id),
          onDrop: () => handleDrop(record.id),
          onDragEnd: handleDragEnd,
          className:
            record.id === dragOverFieldId
              ? 'drag-over-row'
              : record.id === draggingFieldId
                ? 'dragging-row'
                : '',
        })}
      />
    );
  };

  // Form settings form
  const renderSettingsForm = () => {
    const handleSettingsChange = (key, value, index, subKey) => {
      try {
        setFormSettings((prevSettings) => {
          const newSettings = { ...prevSettings };
          if (key === 'cardGroupSetting') {
            if (!newSettings.cardGroupSetting) {
              newSettings.cardGroupSetting = [];
            }
            if (index !== undefined && subKey !== undefined) {
              // Editing a specific property of a card group
              if (newSettings.cardGroupSetting[index]) {
                if (['labelCol', 'wrapperCol'].includes(subKey)) {
                  const span = parseInt(value.span);
                  let validatedSpan = 1;
                  if (!isNaN(span)) {
                    if (span < 1) validatedSpan = 1;
                    else if (span > 24) validatedSpan = 24;
                    else validatedSpan = span;
                  }
                  newSettings.cardGroupSetting[index][subKey] = {
                    span: validatedSpan,
                  };
                } else {
                  newSettings.cardGroupSetting[index][subKey] = value;
                }
              }
            } else if (index !== undefined && value === null) {
              // Removing a card group
              newSettings.cardGroupSetting =
                newSettings.cardGroupSetting.filter((_, i) => i !== index);
            } else if (value && typeof value === 'object' && !subKey) {
              // Adding a new card group (value is the new group object)
              newSettings.cardGroupSetting = [
                ...(newSettings.cardGroupSetting || []),
                value,
              ];
            }
          } else if (key === 'paginationSettings') {
            newSettings.paginationSettings = {
              ...newSettings.paginationSettings,
              [subKey]: value,
            };
          } else if (key === 'globalFilters') {
            if (!newSettings.globalFilters) {
              newSettings.globalFilters = [];
            }
            if (index !== undefined && subKey === 'options') {
              // Editing options of a global filter
              if (!newSettings.globalFilters[index].options) {
                newSettings.globalFilters[index].options = [];
              }
              if (value === null) {
                // Removing an option
                // Correctly remove option by its index or a unique id if available
                newSettings.globalFilters[index].options =
                  newSettings.globalFilters[index].options.filter(
                    (_, optIdx) => optIdx !== value.optIndex
                  ); // Assuming value.optIndex is passed
              } else if (
                typeof value === 'object' &&
                value.hasOwnProperty('label') &&
                value.hasOwnProperty('value')
              ) {
                // Adding or updating an option
                const optionIndex = newSettings.globalFilters[
                  index
                ].options.findIndex((opt) => opt.id === value.id);
                if (optionIndex > -1) {
                  newSettings.globalFilters[index].options[optionIndex] = value;
                } else {
                  newSettings.globalFilters[index].options.push({
                    ...value,
                    id: uuidv4(),
                  });
                }
              }
            } else if (index !== undefined && subKey !== undefined) {
              // Editing a property of a global filter
              if (newSettings.globalFilters[index]) {
                newSettings.globalFilters[index][subKey] = value;
              }
            } else if (index !== undefined && value === null) {
              // Removing a global filter
              newSettings.globalFilters = newSettings.globalFilters.filter(
                (_, i) => i !== index
              );
            } else if (
              value &&
              typeof value === 'object' &&
              !subKey &&
              value.hasOwnProperty('title')
            ) {
              // Adding a new global filter
              newSettings.globalFilters = [
                ...(newSettings.globalFilters || []),
                { ...value, id: uuidv4() },
              ];
            }
          } else {
            // Validate input based on field type
            let validatedValue = value;

            // Special validation for numeric inputs
            if (
              ['labelCol', 'wrapperCol'].includes(key) &&
              typeof value === 'object'
            ) {
              // Ensure span is a valid number between 1-24
              const span = parseInt(value.span);
              if (isNaN(span) || span < 1) {
                validatedValue = { span: 1 };
              } else if (span > 24) {
                validatedValue = { span: 24 };
              }
            }
            newSettings[key] = validatedValue;
          }
          return newSettings;
        });
      } catch (error) {
        console.error('Error updating form settings:', error);
        message.error('Failed to update form settings');
      }
    };

    const addCardGroup = () => {
      const newGroup = {
        key: `group${(formSettings.cardGroupSetting?.length || 0) + 1}`,
        title: `New Card Group ${(formSettings.cardGroupSetting?.length || 0) + 1}`,
        description: '', // Added description field
        labelCol: { span: formSettings.labelCol?.span || 6 },
        wrapperCol: { span: formSettings.wrapperCol?.span || 18 },
        layout: formSettings.layout || 'horizontal',
        gridColumns: formSettings.gridColumns || 1,
      };
      handleSettingsChange('cardGroupSetting', newGroup);
    };

    return (
      <Form layout="vertical">
        <Tabs
          activeKey={currentSettingsTab}
          onChange={setCurrentSettingsTab}
          items={[
            {
              key: 'general',
              label: 'General',
              children: (
                <>
                  <Form.Item label="Page Title">
                    <Input
                      value={formSettings.pageTitle}
                      onChange={(e) =>
                        handleSettingsChange('pageTitle', e.target.value)
                      }
                    />
                  </Form.Item>

                  <Form.Item label="Form Title">
                    <Input
                      value={formSettings.title}
                      onChange={(e) =>
                        handleSettingsChange('title', e.target.value)
                      }
                    />
                  </Form.Item>

                  <Form.Item label="Modal Title">
                    <Input
                      value={formSettings.modalTitle}
                      onChange={(e) =>
                        handleSettingsChange('modalTitle', e.target.value)
                      }
                    />
                  </Form.Item>

                  <Form.Item label="Form Layout">
                    <Select
                      value={formSettings.layout}
                      onChange={(value) =>
                        handleSettingsChange('layout', value)
                      }
                      options={[
                        { label: 'Horizontal', value: 'horizontal' },
                        { label: 'Vertical', value: 'vertical' },
                        { label: 'Inline', value: 'inline' },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item label="Grid Layout Columns (Form & Ungrouped Fields)">
                    <Segmented
                      block
                      options={[
                        {
                          label: (
                            <Tooltip title="Single Column">
                              <div style={{ padding: '4px 0' }}>
                                <BarsOutlined />
                                <div>1 Column</div>
                              </div>
                            </Tooltip>
                          ),
                          value: 1,
                        },
                        {
                          label: (
                            <Tooltip title="Two Columns">
                              <div style={{ padding: '4px 0' }}>
                                <LayoutOutlined />
                                <div>2 Columns</div>
                              </div>
                            </Tooltip>
                          ),
                          value: 2,
                        },
                        {
                          label: (
                            <Tooltip title="Three Columns">
                              <div style={{ padding: '4px 0' }}>
                                <TableOutlined />
                                <div>3 Columns</div>
                              </div>
                            </Tooltip>
                          ),
                          value: 3,
                        },
                        {
                          label: (
                            <Tooltip title="Four Columns">
                              <div style={{ padding: '4px 0' }}>
                                <AppstoreOutlined />
                                <div>4 Columns</div>
                              </div>
                            </Tooltip>
                          ),
                          value: 4,
                        },
                      ]}
                      value={formSettings.gridColumns || 1}
                      onChange={(value) =>
                        handleSettingsChange('gridColumns', value)
                      }
                    />
                  </Form.Item>

                  <Form.Item label="Label Column Width (Form & Ungrouped Fields)">
                    <Input
                      type="number"
                      min={1}
                      max={24}
                      value={formSettings.labelCol?.span}
                      onChange={(e) =>
                        handleSettingsChange('labelCol', {
                          span: parseInt(e.target.value),
                        })
                      }
                    />
                  </Form.Item>

                  <Form.Item label="Wrapper Column Width (Form & Ungrouped Fields)">
                    <Input
                      type="number"
                      min={1}
                      max={24}
                      value={formSettings.wrapperCol?.span}
                      onChange={(e) =>
                        handleSettingsChange('wrapperCol', {
                          span: parseInt(e.target.value),
                        })
                      }
                    />
                  </Form.Item>
                </>
              ),
            },
            {
              key: 'cardGroups',
              label: 'Card Groups',
              children: (
                <>
                  <Paragraph type="secondary">
                    Define groups of fields to be displayed within separate
                    cards in the form. This is useful for organizing complex
                    forms.
                  </Paragraph>
                  {(formSettings.cardGroupSetting || []).map((group, index) => (
                    <Card
                      key={index}
                      title={`Card Group: ${group.title || group.key}`}
                      size="small"
                      style={{ marginBottom: 16 }}
                      extra={
                        <Button
                          icon={<DeleteOutlined />}
                          onClick={() =>
                            handleSettingsChange(
                              'cardGroupSetting',
                              null,
                              index
                            )
                          }
                          danger
                          type="text"
                          title="Remove Card Group"
                        />
                      }
                    >
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label="Group Key (Unique ID)">
                            <Input
                              value={group.key}
                              onChange={(e) =>
                                handleSettingsChange(
                                  'cardGroupSetting',
                                  e.target.value,
                                  index,
                                  'key'
                                )
                              }
                              placeholder="e.g., personalDetails, addressInfo"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="Group Title">
                            <Input
                              value={group.title}
                              onChange={(e) =>
                                handleSettingsChange(
                                  'cardGroupSetting',
                                  e.target.value,
                                  index,
                                  'title'
                                )
                              }
                              placeholder="e.g., Personal Details"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item label="Group Description">
                        <Input.TextArea
                          value={group.description}
                          onChange={(e) =>
                            handleSettingsChange(
                              'cardGroupSetting',
                              e.target.value,
                              index,
                              'description'
                            )
                          }
                          placeholder="Optional description for the card group"
                          rows={2}
                        />
                      </Form.Item>
                      <Form.Item label="Group Layout">
                        <Select
                          value={group.layout}
                          onChange={(value) =>
                            handleSettingsChange(
                              'cardGroupSetting',
                              value,
                              index,
                              'layout'
                            )
                          }
                          options={[
                            { label: 'Horizontal', value: 'horizontal' },
                            { label: 'Vertical', value: 'vertical' },
                            { label: 'Inline', value: 'inline' },
                          ]}
                        />
                      </Form.Item>
                      <Form.Item label="Group Grid Layout Columns">
                        <Segmented
                          block
                          options={[
                            {
                              label: (
                                <Tooltip title="Single Column">
                                  <BarsOutlined /> 1
                                </Tooltip>
                              ),
                              value: 1,
                            },
                            {
                              label: (
                                <Tooltip title="Two Columns">
                                  <LayoutOutlined /> 2
                                </Tooltip>
                              ),
                              value: 2,
                            },
                            {
                              label: (
                                <Tooltip title="Three Columns">
                                  <TableOutlined /> 3
                                </Tooltip>
                              ),
                              value: 3,
                            },
                            {
                              label: (
                                <Tooltip title="Four Columns">
                                  <AppstoreOutlined /> 4
                                </Tooltip>
                              ),
                              value: 4,
                            },
                          ]}
                          value={group.gridColumns || 1}
                          onChange={(value) =>
                            handleSettingsChange(
                              'cardGroupSetting',
                              value,
                              index,
                              'gridColumns'
                            )
                          }
                        />
                      </Form.Item>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label="Group Label Column Width">
                            <InputNumber
                              min={1}
                              max={24}
                              value={group.labelCol?.span}
                              onChange={(value) =>
                                handleSettingsChange(
                                  'cardGroupSetting',
                                  { span: value },
                                  index,
                                  'labelCol'
                                )
                              }
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="Group Wrapper Column Width">
                            <InputNumber
                              min={1}
                              max={24}
                              value={group.wrapperCol?.span}
                              onChange={(value) =>
                                handleSettingsChange(
                                  'cardGroupSetting',
                                  { span: value },
                                  index,
                                  'wrapperCol'
                                )
                              }
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    onClick={addCardGroup}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Card Group
                  </Button>
                </>
              ),
            },
            {
              key: 'pagination',
              label: 'Pagination',
              children: (
                <>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Page Size">
                        <InputNumber
                          value={formSettings.paginationSettings?.pageSize}
                          onChange={(value) =>
                            handleSettingsChange(
                              'paginationSettings',
                              value,
                              undefined,
                              'pageSize'
                            )
                          }
                          min={1}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Page Size Options">
                        <Select
                          mode="tags"
                          tokenSeparators={[',']}
                          value={
                            formSettings.paginationSettings?.pageSizeOptions ||
                            []
                          }
                          onChange={(values) => {
                            // Convert string values to strings and ensure they're valid numbers
                            const validValues = values
                              .map((val) => String(val).trim())
                              .filter((val) => val && !isNaN(val));
                            handleSettingsChange(
                              'paginationSettings',
                              validValues,
                              undefined,
                              'pageSizeOptions'
                            );
                          }}
                          placeholder="Add page size options (e.g., 10, 20, 50)"
                          style={{ width: '100%' }}
                        />
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#8c8c8c',
                            marginTop: '4px',
                          }}
                        >
                          Type numbers and press Enter or comma to add values
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Show Size Changer"
                        valuePropName="checked"
                      >
                        <Switch
                          checked={
                            formSettings.paginationSettings?.showSizeChanger
                          }
                          onChange={(checked) =>
                            handleSettingsChange(
                              'paginationSettings',
                              checked,
                              undefined,
                              'showSizeChanger'
                            )
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Show Quick Jumper"
                        valuePropName="checked"
                      >
                        <Switch
                          checked={
                            formSettings.paginationSettings?.showQuickJumper
                          }
                          onChange={(checked) =>
                            handleSettingsChange(
                              'paginationSettings',
                              checked,
                              undefined,
                              'showQuickJumper'
                            )
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              ),
            },
            {
              key: 'globalFilters',
              label: 'Global Filters',
              children: (
                <>
                  {(formSettings.globalFilters || []).map((filter, index) => (
                    <Card
                      key={filter.id || index}
                      size="small"
                      title={`Filter ${index + 1}: ${filter.title || 'New Filter'}`}
                      style={{ marginBottom: 16 }}
                      extra={
                        <Button
                          icon={<DeleteOutlined />}
                          danger
                          type="text"
                          onClick={() =>
                            handleSettingsChange('globalFilters', null, index)
                          }
                        />
                      }
                    >
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label="Filter Title">
                            <Input
                              value={filter.title}
                              onChange={(e) =>
                                handleSettingsChange(
                                  'globalFilters',
                                  e.target.value,
                                  index,
                                  'title'
                                )
                              }
                              placeholder="e.g., Search by Name"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="Filter Type">
                            <Select
                              value={filter.type}
                              onChange={(value) =>
                                handleSettingsChange(
                                  'globalFilters',
                                  value,
                                  index,
                                  'type'
                                )
                              }
                            >
                              <Select.Option value="text">
                                Text Search
                              </Select.Option>
                              <Select.Option value="select">
                                Select Dropdown
                              </Select.Option>
                              <Select.Option value="dateRange">
                                Date Range
                              </Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item label="Field(s) to Filter">
                        <Select
                          mode="multiple"
                          allowClear
                          style={{ width: '100%' }}
                          placeholder="Select fields to filter"
                          value={
                            typeof filter.field === 'string'
                              ? filter.field
                                  .split(',')
                                  .map((s) => s.trim())
                                  .filter((s) => s)
                              : filter.field || []
                          }
                          onChange={(value) =>
                            handleSettingsChange(
                              'globalFilters',
                              value,
                              index,
                              'field'
                            )
                          }
                          options={formFields.map((f) => ({
                            label: f.title || f.dataIndex,
                            value: f.dataIndex,
                          }))}
                        />
                      </Form.Item>
                      {filter.type === 'select' && (
                        <Form.List name={['globalFilters', index, 'options']}>
                          {(fields, { add, remove }) => (
                            <>
                              <Text
                                strong
                                style={{ marginBottom: 8, display: 'block' }}
                              >
                                Options for Select Filter:
                              </Text>
                              {fields.map((optField, optIndex) => (
                                <Card
                                  key={optField.key}
                                  size="small"
                                  style={{
                                    marginBottom: 8,
                                    background: '#f9f9f9',
                                  }}
                                  title={`Option ${optIndex + 1}`}
                                >
                                  <Row gutter={8}>
                                    <Col span={10}>
                                      <Form.Item
                                        name={[optField.name, 'label']}
                                        label="Label"
                                        rules={[{ required: true }]}
                                      >
                                        <Input
                                          placeholder="Display Label"
                                          onChange={(e) =>
                                            handleSettingsChange(
                                              'globalFilters',
                                              {
                                                ...formSettings.globalFilters[
                                                  index
                                                ].options[optIndex],
                                                label: e.target.value,
                                                id:
                                                  formSettings.globalFilters[
                                                    index
                                                  ].options[optIndex]?.id ||
                                                  uuidv4(),
                                              },
                                              index,
                                              'options',
                                              {
                                                optIndex: optIndex,
                                                id:
                                                  formSettings.globalFilters[
                                                    index
                                                  ].options[optIndex]?.id ||
                                                  uuidv4(),
                                                label: e.target.value,
                                                value:
                                                  formSettings.globalFilters[
                                                    index
                                                  ].options[optIndex]?.value,
                                              }
                                            )
                                          }
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col span={10}>
                                      <Form.Item
                                        name={[optField.name, 'value']}
                                        label="Value"
                                        rules={[{ required: true }]}
                                      >
                                        <Input
                                          placeholder="Stored Value"
                                          onChange={(e) =>
                                            handleSettingsChange(
                                              'globalFilters',
                                              {
                                                ...formSettings.globalFilters[
                                                  index
                                                ].options[optIndex],
                                                value: e.target.value,
                                                id:
                                                  formSettings.globalFilters[
                                                    index
                                                  ].options[optIndex]?.id ||
                                                  uuidv4(),
                                              },
                                              index,
                                              'options',
                                              {
                                                optIndex: optIndex,
                                                id:
                                                  formSettings.globalFilters[
                                                    index
                                                  ].options[optIndex]?.id ||
                                                  uuidv4(),
                                                label:
                                                  formSettings.globalFilters[
                                                    index
                                                  ].options[optIndex]?.label,
                                                value: e.target.value,
                                              }
                                            )
                                          }
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col
                                      span={4}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        paddingTop: '30px',
                                      }}
                                    >
                                      <Button
                                        icon={<DeleteOutlined />}
                                        danger
                                        type="text"
                                        onClick={() => {
                                          remove(optField.name);
                                          handleSettingsChange(
                                            'globalFilters',
                                            { optIndex: optIndex },
                                            index,
                                            'options',
                                            null
                                          );
                                        }}
                                      />
                                    </Col>
                                  </Row>
                                </Card>
                              ))}
                              <Button
                                type="dashed"
                                onClick={() => {
                                  add({ label: '', value: '' });
                                  handleSettingsChange(
                                    'globalFilters',
                                    {
                                      label: 'New Option',
                                      value: 'new_option',
                                      id: uuidv4(),
                                    },
                                    index,
                                    'options'
                                  );
                                }}
                                block
                                icon={<PlusOutlined />}
                              >
                                Add Option
                              </Button>
                            </>
                          )}
                        </Form.List>
                      )}
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() =>
                      handleSettingsChange('globalFilters', {
                        id: uuidv4(),
                        title: 'New Filter',
                        field: [],
                        type: 'text',
                        options: [],
                      })
                    }
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Global Filter
                  </Button>
                </>
              ),
            },
          ]}
        />
      </Form>
    );
  };

  return (
    <Card>
      <Title level={2}>Form Builder</Title>
      <Text>Design your user management form structure and generate code</Text>

      {/* Template selection */}
      <div style={{ marginBottom: 24 }}>
        <Card title="Form Template" size="small">
          <div
            style={{
              display: 'flex',
              overflowX: 'auto',
              gap: 16,
              padding: '8px 0',
            }}
          >
            {formTemplates.map((template) => (
              <Card
                key={template.id}
                hoverable
                style={{
                  width: 200,
                  border:
                    selectedTemplate === template.id
                      ? '2px solid #006964'
                      : '1px solid #f0f0f0',
                }}
                size="small"
                actions={[
                  <EyeOutlined
                    key="view"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewPage(template.name);
                    }}
                    title="View Page"
                  />,
                  <EditOutlined
                    key="edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTemplateSelect(template.id);
                    }}
                  />,
                  <DeleteOutlined
                    key="del"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template.id);
                    }}
                  />,
                ]}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div style={{ fontSize: 24 }}>{template.icon}</div>
                  <div style={{ fontWeight: 'bold' }}>{template.name}</div>
                  <div
                    style={{ fontSize: 12, color: '#666', textAlign: 'center' }}
                  >
                    {template.description}
                  </div>
                  {selectedTemplate === template.id && (
                    <Tag color="primary">Selected</Tag>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>

      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: '1',
            label: 'Settings',
            children: renderSettingsForm(),
          },
          {
            key: '2',
            label: 'Fields',
            children: (
              <>
                <div
                  style={{
                    marginBottom: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddField}
                  >
                    Add Field
                  </Button>
                  <Tooltip title="Add common field presets">
                    <Button icon={<ThunderboltOutlined />} type="default">
                      Field Presets
                    </Button>
                  </Tooltip>
                </div>

                {/* Field Presets Section */}
                <div style={{ marginBottom: '16px' }}>
                  <Card
                    size="small"
                    title="Common Field Presets"
                    style={{ marginBottom: '16px' }}
                  >
                    <div
                      style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
                    >
                      {fieldPresets.map((preset) => (
                        <Button
                          key={preset.name}
                          icon={preset.icon}
                          onClick={() => handleAddPresetField(preset)}
                        >
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  </Card>
                </div>

                {renderFieldsTable()}
              </>
            ),
          },
          {
            key: '3',
            label: 'Preview',
            children: (
              <Card>
                <CrudTable
                  title={formSettings.title || 'Preview'}
                  data={previewData}
                  setData={setPreviewData}
                  onAdd={(curr, set) => async (record) =>
                    set([...curr, { id: Date.now(), ...record }])
                  }
                  onEdit={(curr, set) => async (key, record) => {
                    const newData = curr.map((item) =>
                      item.id === key ? { ...item, ...record } : item
                    );
                    set(newData);
                  }}
                  onDelete={(curr, set) => async (keys) => {
                    set(curr.filter((item) => !keys.includes(item.id)));
                  }}
                  onExport={() => {}}
                  loading={false}
                  customColumns={computeCrudOptions()}
                  rowkeys={['id']}
                />
              </Card>
            ),
          },
        ]}
      />

      <Divider />

      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button
            onClick={handleSaveDesign}
            icon={<DatabaseOutlined />}
            type="default"
          >
            Save Form Design
          </Button>
          <FormCodeGenerator
            formFields={formFields}
            formSettings={formSettings}
            formTitle={formSettings.title}
            tableName={(formSettings.title || '')
              .toLowerCase()
              .replace(/\s+/g, '_')}
          />
        </Space>
      </div>

      {renderFieldForm()}
    </Card>
  );
};

export default FormBuilder;
