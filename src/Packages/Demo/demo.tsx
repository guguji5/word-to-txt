import React, { useState } from 'react';
import { Button, Modal, Collapse, Space, Row, Col, Input, Form } from 'antd';
import PageLayout from '@/components/pageLayout';
import { wordContent, txtContent } from './utils';
import './index.less';
import { copy2ClipBoard } from '@/utils';
import DiffViewer from './diffReviewer';

export default function Demo() {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [translateTxt, setTranslateTxt] = useState('');
  const handleGenerate = async () => {
    const values = await form.validateFields();
    const { word, txt } = values;
    const wordArr = word.split('\n').map((i) => {
      if (i.includes('.')) {
        const arr = i.split('.');
        arr.shift();
        return arr.join('.').trim();
      } else {
        return i.trim();
      }
    });

    const txtArr = txt.split('\n');
    for (let i = 0; i < txtArr.length; i++) {
      if (!txtArr[i].startsWith('#')) {
        const indexInWordArr = wordArr.findIndex((j) => j === txtArr[i].trim());
        txtArr[i] = [txtArr[i], wordArr[indexInWordArr + 1]];
      }
    }
    setTranslateTxt(txtArr.flat().join('\n'));
    setVisible(true);
  };

  return (
    <PageLayout
      title={'word 插入 txt'}
      rightArea={
        <Space>
          <Button onClick={handleGenerate} type='primary'>
            Generate
          </Button>
          <Button onClick={() => form.resetFields()} type='primary' ghost>
            Reset
          </Button>
        </Space>
      }
    >
      <div>
        <Form form={form} layout='vertical' className='h-100'>
          <Row gutter={16} style={{ height: '100%' }}>
            <Col span={12}>
              <Form.Item label='请粘贴word内容' name='word' rules={[{ required: true, message: '不可为空' }]} style={{ height: '100%' }}>
                <Input.TextArea placeholder={wordContent} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label='请粘贴txt内容' name='txt' rules={[{ required: true, message: '不可为空' }]} style={{ height: '100%' }}>
                <Input.TextArea placeholder={txtContent} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
      <Modal
        width={'80%'}
        title={'txt变更记录'}
        visible={visible}
        onCancel={() => setVisible(false)}
        onOk={() => {
          copy2ClipBoard(translateTxt);
          setVisible(false);
        }}
        okText='Copy to clipboard'
      >
        <div style={{ maxHeight: 600, overflowY: 'auto' }}>
          <DiffViewer new_content={translateTxt} old_content={form.getFieldValue('txt')} />
        </div>
      </Modal>
    </PageLayout>
  );
}
