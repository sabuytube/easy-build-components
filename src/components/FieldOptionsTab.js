import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Radio,
  Empty,
  Alert,
  Row,
  Col,
  Card,
  message,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const FieldOptionsTab = ({
  form,
  setCurrentFieldFormTab,
  tables = [],
  columns = [],
  onTableChange,
  loading = false,
}) => {
  const optionsConfig = Form.useWatch('optionsConfig', form);
  const optionsMode = optionsConfig?.mode || 'manual';
  const selectedTable = optionsConfig?.table;

  const selectedType = form.getFieldValue('type');
  const showOptions = ['select', 'radio', 'tags', 'checkbox'].includes(
    selectedType
  );

  if (!showOptions) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span>
            Options are only available for Select, Radio, Checkbox, and Tags
            field types.
            <br />
            <Button type="link" onClick={() => setCurrentFieldFormTab('basic')}>
              Change field type
            </Button>
          </span>
        }
      />
    );
  }

  return (
    <>
      <Form.Item label="Options Source">
        <Radio.Group
          value={optionsMode}
          onChange={(e) => {
            const newMode = e.target.value;
            const currentConfig = form.getFieldValue('optionsConfig') || {};
            form.setFieldsValue({
              optionsConfig: {
                ...currentConfig,
                mode: newMode,
                table: undefined,
                labelField: undefined,
                valueField: undefined,
                json: undefined,
              },
            });
            if (
              newMode === 'manual' &&
              !form.getFieldValue('options')?.length
            ) {
              form.setFieldValue('options', [
                { label: 'Option 1', value: 'option1' },
              ]);
            } else {
              form.setFieldValue('options', []);
            }
          }}
        >
          <Radio.Button value="manual">Manual</Radio.Button>
          <Radio.Button value="table">From Table</Radio.Button>
          <Radio.Button value="json">From JSON</Radio.Button>
        </Radio.Group>
      </Form.Item>

      <Form.Item name="optionsConfig" hidden>
        <Input />
      </Form.Item>

      {optionsMode === 'manual' && (
        <Form.List name="options">
          {(fields, { add, remove }) => (
            <>
              <Alert
                message="Manually define options"
                description="Add, edit or remove options that will be available to users."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              {fields.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No options added yet"
                  style={{ margin: '20px 0' }}
                >
                  <Button
                    type="primary"
                    onClick={() =>
                      add({ label: 'New Option', value: 'newOption' })
                    }
                    icon={<PlusOutlined />}
                  >
                    Add First Option
                  </Button>
                </Empty>
              ) : (
                <div
                  style={{
                    maxHeight: '400px',
                    overflow: 'auto',
                    padding: '8px 0',
                  }}
                >
                  {fields.map((field, index) => (
                    <Card
                      key={field.key}
                      size="small"
                      style={{ marginBottom: 8 }}
                      title={`Option ${index + 1}`}
                      extra={
                        <Button
                          icon={<DeleteOutlined />}
                          onClick={() => remove(field.name)}
                          danger
                          type="text"
                        />
                      }
                    >
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'label']}
                            rules={[
                              { required: true, message: 'Missing label' },
                            ]}
                            label="Label"
                            tooltip="Text shown to users"
                          >
                            <Input placeholder="Display text" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'value']}
                            rules={[
                              { required: true, message: 'Missing value' },
                            ]}
                            label="Value"
                            tooltip="Value stored in database"
                          >
                            <Input placeholder="Stored value" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </div>
              )}
              <Form.Item style={{ marginTop: 16 }}>
                <Button
                  type="dashed"
                  onClick={() => add({ label: '', value: '' })}
                  icon={<PlusOutlined />}
                  block
                >
                  Add Option
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      )}

      {optionsMode === 'table' && (
        <>
          <Alert
            message="Fetch options from a database table"
            description="Select a table, then choose which columns to use for the option label and value."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form.Item
            name={['optionsConfig', 'table']}
            label="Table"
            rules={[{ required: true, message: 'Please select a table' }]}
          >
            <Select
              showSearch
              loading={loading}
              placeholder="Select a table"
              options={(tables || []).map((t) => ({
                label: t.table_name || t.name || t,
                value: t.table_name || t.name || t,
              }))}
              onChange={(value) => {
                const config = form.getFieldValue('optionsConfig');
                form.setFieldsValue({
                  optionsConfig: {
                    ...config,
                    labelField: undefined,
                    valueField: undefined,
                  },
                });
                // เรียก callback ให้ parent component ดึงข้อมูล columns
                if (onTableChange) {
                  onTableChange(value);
                }
              }}
            />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) =>
              prev.optionsConfig?.table !== curr.optionsConfig?.table
            }
          >
            {() =>
              form.getFieldValue(['optionsConfig', 'table']) ? (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name={['optionsConfig', 'valueField']}
                      label="Value Field"
                      rules={[
                        {
                          required: true,
                          message: 'Please select a value field',
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        loading={loading}
                        placeholder="Select field for value"
                        options={(columns || []).map((c) => ({
                          label: c.column_name || c.name || c,
                          value: c.column_name || c.name || c,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={['optionsConfig', 'labelField']}
                      label="Label Field"
                      rules={[
                        {
                          required: true,
                          message: 'Please select a label field',
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        loading={loading}
                        placeholder="Select field for label"
                        options={(columns || []).map((c) => ({
                          label: c.column_name || c.name || c,
                          value: c.column_name || c.name || c,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              ) : null
            }
          </Form.Item>
        </>
      )}

      {optionsMode === 'json' && (
        <>
          <Alert
            message="Provide options as a JSON array"
            description='The format must be an array of objects, with each object having a "label" and "value" key. e.g. [{"label": "Active", "value": "active"}]'
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form.Item
            name={['optionsConfig', 'json']}
            label="JSON Options"
            rules={[
              {
                validator: async (_, value) => {
                  if (!value) return;
                  try {
                    const parsed = JSON.parse(value);
                    if (!Array.isArray(parsed))
                      throw new Error('Must be a JSON array.');
                    const isValid = parsed.every(
                      (item) =>
                        typeof item === 'object' &&
                        item !== null &&
                        'label' in item &&
                        'value' in item
                    );
                    if (!isValid)
                      throw new Error(
                        'Each item must be an object with "label" and "value" keys.'
                      );
                  } catch (e) {
                    throw new Error(e.message || 'Invalid JSON format.');
                  }
                },
              },
            ]}
          >
            <TextArea
              rows={8}
              placeholder='[{"label": "Test 1", "value": "test1"}, {"label": "Test 2", "value": "test2"}]'
            />
          </Form.Item>
        </>
      )}
    </>
  );
};

export default FieldOptionsTab;
