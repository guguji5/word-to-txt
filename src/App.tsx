import React, { useState, useEffect } from 'react';
import './App.less';
import 'antd/dist/antd.less';
import './global.variable.less';
import { ConfigProvider, Empty } from 'antd';
import Content from './routers';
import { BrowserRouter as Router } from 'react-router-dom';
import moment from 'moment';

function App() {
  return (
    <div className='App'>
      <ConfigProvider renderEmpty={() => <Empty description='无数据' />}>
        <Router>
          <Content></Content>
        </Router>
      </ConfigProvider>
    </div>
  );
}

export default App;
