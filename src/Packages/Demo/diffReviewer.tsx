import React, { useState, useEffect } from 'react';
import * as jsDiff from 'diff';
import { Modal, Button } from 'antd';
import cx from 'classnames';
import './style.less';
interface IProps {
  new_content: any;
  old_content: any;
}

const BLOCK_LENGTH = 5;

const getLNPadding = (origin) => {
  const item = ('     ' + origin).slice(-5);
  return <div className={cx('splitLN')}>{item}</div>;
};
const getPaddingContent = (item) => {
  return <div className={cx('splitCon')}>{item}</div>;
};
const getSplitCode = (targetBlock, isHead = true) => {
  const {
    type,
    content: { head, hidden, tail },
    leftPos,
    rightPos,
  } = targetBlock;
  return (isHead ? head : tail).map((item, index) => {
    const shift = isHead ? 0 : head.length + hidden.length;
    return (
      <div key={(isHead ? 'h-' : 't-') + index}>
        <div className={cx('iBlock', 'lBorder')}>
          {getLNPadding(leftPos + shift + index)}
          {getPaddingContent('    ' + item)}
        </div>
        <div className={'iBlock'}>
          {getLNPadding(rightPos + shift + index)}
          {getPaddingContent('    ' + item)}
        </div>
      </div>
    );
  });
};
const getHiddenBtn = (hidden, index, openBlock) => {
  const isSingle = hidden.length < BLOCK_LENGTH * 2;
  return (
    <div key='collapse' className='cutWrapper'>
      <div className={cx('colLeft', 'splitWidth')}>
        {isSingle ? (
          <div className='arrow' onClick={openBlock('all', index)}>
            <svg className='octicon' viewBox='0 0 16 16' version='1.1' width='16' height='16' aria-hidden='true'>
              <path
                fillRule='evenodd'
                d='M8.177.677l2.896 2.896a.25.25 0 01-.177.427H8.75v1.25a.75.75 0 01-1.5 0V4H5.104a.25.25 0 01-.177-.427L7.823.677a.25.25 0 01.354 0zM7.25 10.75a.75.75 0 011.5 0V12h2.146a.25.25 0 01.177.427l-2.896 2.896a.25.25 0 01-.354 0l-2.896-2.896A.25.25 0 015.104 12H7.25v-1.25zm-5-2a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5zM6 8a.75.75 0 01-.75.75h-.5a.75.75 0 010-1.5h.5A.75.75 0 016 8zm2.25.75a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5zM12 8a.75.75 0 01-.75.75h-.5a.75.75 0 010-1.5h.5A.75.75 0 0112 8zm2.25.75a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5z'
              ></path>
            </svg>
          </div>
        ) : (
          <React.Fragment>
            <div className='arrow' onClick={openBlock('head', index)}>
              <svg className='octicon' viewBox='0 0 16 16' version='1.1' width='16' height='16' aria-hidden='true'>
                <path
                  fillRule='evenodd'
                  d='M8.177 14.323l2.896-2.896a.25.25 0 00-.177-.427H8.75V7.764a.75.75 0 10-1.5 0V11H5.104a.25.25 0 00-.177.427l2.896 2.896a.25.25 0 00.354 0zM2.25 5a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5zM6 4.25a.75.75 0 01-.75.75h-.5a.75.75 0 010-1.5h.5a.75.75 0 01.75.75zM8.25 5a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5zM12 4.25a.75.75 0 01-.75.75h-.5a.75.75 0 010-1.5h.5a.75.75 0 01.75.75zm2.25.75a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5z'
                ></path>
              </svg>
            </div>
            <div className='arrow' onClick={openBlock('tail', index)}>
              <svg className='octicon' viewBox='0 0 16 16' version='1.1' width='16' height='16' aria-hidden='true'>
                <path
                  fillRule='evenodd'
                  d='M7.823 1.677L4.927 4.573A.25.25 0 005.104 5H7.25v3.236a.75.75 0 101.5 0V5h2.146a.25.25 0 00.177-.427L8.177 1.677a.25.25 0 00-.354 0zM13.75 11a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zm-3.75.75a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5a.75.75 0 01-.75-.75zM7.75 11a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM4 11.75a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5a.75.75 0 01-.75-.75zM1.75 11a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5z'
                ></path>
              </svg>
            </div>
          </React.Fragment>
        )}
      </div>
      <div className={cx('collRight', 'collRightSplit')}>
        <div className={cx('colRContent', isSingle ? '' : 'cRHeight')}>{`当前隐藏内容:${hidden.length}行`}</div>
      </div>
    </div>
  );
};
const getCombinePart = (leftPart: any = {}, rightPart: any = {}) => {
  const { type: lType, content: lContent, leftPos: lLeftPos, rightPos: lRightPos } = leftPart;
  const { type: rType, content: rContent, leftPos: rLeftPos, rightPos: rRightPos } = rightPart;
  const lArr = lContent?.head || [];
  const rArr = rContent?.head || [];
  const lClass = lType === '+' ? 'add' : 'removed';
  const rClass = rType === '+' ? 'add' : 'removed';
  return (
    <React.Fragment>
      <div className={cx('iBlock', 'lBorder')}>
        {lArr.map((item, index) => {
          return (
            <div className={cx('prBlock', lClass)} key={index}>
              {getLNPadding(lLeftPos + index)}
              {getPaddingContent('-  ' + item)}
            </div>
          );
        })}
      </div>
      <div className={cx('iBlock', lArr.length ? '' : 'rBorder')}>
        {rArr.map((item, index) => {
          return (
            <div className={cx('prBlock', rClass)} key={index}>
              {getLNPadding(rRightPos + index)}
              {getPaddingContent('+  ' + item)}
            </div>
          );
        })}
      </div>
    </React.Fragment>
  );
};

function DiffViewer(props: IProps) {
  const { new_content, old_content } = props;
  const [lineGroup, setLineGroup] = useState<any[]>([]);
  const openBlock = (type, index) => {
    const copyOfLG = lineGroup.slice();
    const targetGroup = copyOfLG[index];
    const { head, tail, hidden } = targetGroup.content;
    if (type === 'head') {
      targetGroup.content.head = head.concat(hidden.slice(0, BLOCK_LENGTH));
      targetGroup.content.hidden = hidden.slice(BLOCK_LENGTH);
    } else if (type === 'tail') {
      const hLenght = hidden.length;
      targetGroup.content.tail = hidden.slice(hLenght - BLOCK_LENGTH).concat(tail);
      targetGroup.content.hidden = hidden.slice(0, hLenght - BLOCK_LENGTH);
    } else {
      targetGroup.content.head = head.concat(hidden);
      targetGroup.content.hidden = [];
    }
    copyOfLG[index] = targetGroup;
    setLineGroup(copyOfLG);
  };
  const getSplitContent = () => {
    const length = lineGroup.length;
    const contentList: any[] = [];
    for (let i = 0; i < length; i++) {
      const targetBlock = lineGroup[i];
      const {
        type,
        content: { hidden },
      } = targetBlock;
      if (type === ' ') {
        contentList.push(
          <div key={i}>
            {getSplitCode(targetBlock)}
            {(hidden.length && getHiddenBtn(hidden, i, openBlock)) || null}
            {getSplitCode(targetBlock, false)}
          </div>,
        );
      } else if (type === '-') {
        const nextTarget = lineGroup[i + 1] || { content: {} };
        const nextIsPlus = nextTarget.type === '+';
        contentList.push(<div key={i}>{getCombinePart(targetBlock, nextIsPlus ? nextTarget : {})}</div>);
        nextIsPlus ? (i = i + 1) : void 0;
      } else if (type === '+') {
        contentList.push(<div key={i}>{getCombinePart({}, targetBlock)}</div>);
      }
    }
    return <div>{contentList}</div>;
  };

  useEffect(() => {
    const newArr = jsDiff.diffJson(old_content, new_content);
    if (typeof newArr === 'string') return;
    const initLineGroup = newArr.map((item, index, originArr) => {
      let added, removed, value, count;
      added = item.added;
      removed = item.removed;
      value = item.value;
      count = item.count;
      const strArr = value?.split('\n').filter((item) => item) || [];
      const type = (added && '+') || (removed && '-') || ' ';
      let head, hidden, tail;
      if (type !== ' ') {
        hidden = [];
        tail = [];
        head = strArr;
      } else {
        const strLength = strArr.length;
        if (strLength <= BLOCK_LENGTH * 2) {
          hidden = [];
          tail = [];
          head = strArr;
        } else {
          head = strArr.slice(0, BLOCK_LENGTH);
          hidden = strArr.slice(BLOCK_LENGTH, strLength - BLOCK_LENGTH);
          tail = strArr.slice(strLength - BLOCK_LENGTH);
        }
      }
      return {
        type,
        count,
        content: {
          hidden,
          head,
          tail,
        },
      };
    });
    let lStartNum = 1;
    let rStartNum = 1;
    initLineGroup.forEach((item) => {
      const { type, count } = item;
      item.leftPos = lStartNum;
      item.rightPos = rStartNum;
      lStartNum += type === '+' ? 0 : count;
      rStartNum += type === '-' ? 0 : count;
    });
    setLineGroup(initLineGroup);
  }, []);

  return <div className='diff-viewer'>{getSplitContent()}</div>;
}

export default DiffViewer;
