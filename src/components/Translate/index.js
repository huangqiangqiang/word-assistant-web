import * as React from 'react';
import './index.less';
import { message } from 'antd';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import HttpTool from '../../utils/HttpTool';
import HQQTool from '../../utils/HQQTool';

const classPrefix = 'Translate';

class Translate extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isCommand: false,
    };
  }

  componentDidMount(){
    // 监听回车
    document.onkeyup = (e) => {
      if(e.keyCode == 91) {
        this.setState({
          isCommand: false,
        });
      }
    };

    // 监听command + s
    document.onkeydown = (e) => {
      if (e.keyCode === 91) {
        this.setState({
          isCommand: true,
        });
      }
      if (e.keyCode == 83 && this.state.isCommand == true) {
        this.toTranslate();
        return false;
      }

      if (e.keyCode === 13) {
        this.toTranslate();
      }
    };

    // 监听scroll，同步两边div滚动
    this.inputTextRef.addEventListener('scroll',(e)=>{
      this.displayRef.scrollTop = e.target.scrollTop;
    });
  }

  toTranslate = () => {
    if (this.inputTextRef.value.length === 0) {
      message.error('请输入需要翻译的单词');
      return;
    }
    if (!HQQTool.isLetter(this.inputTextRef.value)) {
      message.error('只能输入字母！');
      return;
    }
    let qArr = this.inputTextRef.value.split('\n');
    // 去掉两边空格
    qArr = _.map(qArr, _.trim);
    // 转为小写
    qArr = _.map(qArr, (item)=>{
      return item.toLowerCase();
    });
    HttpTool.translate(qArr, (res)=>{
      if (res.data.status === 0) {
        message.error(res.data.message);
        return;
      }
      const result = res.data.data;
      console.log('translate end',result);
      this.displayRef.innerText = '';
      for (let i = 0; i < qArr.length; i++) {
        const currQuery = qArr[i];
        // 取出当前行的翻译信息
        const translates = result.filter((item)=>{
          return (item.baseInfo.src === currQuery);
        });
        if (translates.length > 0) {
          this.displayRef.innerText += translates[0].baseInfo.dst + '\n';
        } else {
          // 可能是个空行
          this.displayRef.innerText += '\n';
        }
      }
      this.displayRef.innerText += '\n';
      this.displayRef.scrollTop = this.inputTextRef.scrollTop;
    }, (e) => {
      if (e.response && e.response.status === 401) {
        localStorage.removeItem('token');
        location.reload();
        return;
      }
      console.log(e);
      message.error('服务器异常，请稍后再试！');
    });
  }

  render() {
    return (
      <div className={classPrefix}>
        <div className={`${classPrefix}-container`}>
          <textarea className={`${classPrefix}-input`} placeholder='输入单词后按“回车”或“ctrl+s”' ref={(el)=>this.inputTextRef=el} />
          <div className={`${classPrefix}-display`} ref={(el)=>this.displayRef=el} />
        </div>
        <div className={`${classPrefix}-icon-container`}>
          <div>英</div>
          <svg className={`${classPrefix}-icon`}>
            <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"></path>
          </svg>
          <div>中</div>
        </div>
      </div>
    );
  }
}

export default withRouter(Translate);