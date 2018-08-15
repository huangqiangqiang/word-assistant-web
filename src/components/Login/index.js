import * as React from 'react';
import './index.less';
import { Button, message } from 'antd';
import { withRouter } from 'react-router-dom';
import HttpTool from '../../utils/HttpTool';
import md5 from 'md5';

const classPrefix = 'Login';

class Login extends React.Component {

  static needShowNavigationbar = () => {
    return false;
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  login = () => {
    if (this.phoneRef.value.length === 0) {
      message.error('请输入昵称！');
      return;
    }
    if (this.phoneRef.value.length <= 2) {
      message.error('昵称至少三个字符！');
      return;
    }
    if (this.pwdRef.value.length === 0) {
      message.error('请输入密码！');
      return;
    }
    this.setState({
      loading: true
    });
    HttpTool.login({
      phone: this.phoneRef.value,
      pwd: md5(this.pwdRef.value)
    }, (res)=>{
      console.log(res);
      if (res.data.status === 0) {
        message.error(res.data.message);
        return;
      }
      this.setState({
        loading: false
      });
      HttpTool.setToken(res.data.data.token);
      this.props.history.push('/');
    }, (e)=>{
      console.log(e);
      message.error('服务器异常，请稍后再试！');
    });
  }

  render() {
    return (
      <div className={classPrefix}>
        <div className={`${classPrefix}-container`}>
          <h1 className={`${classPrefix}-container-title`}>LOGIN</h1>
          <p className={`${classPrefix}-container-desc`}>* 未注册的手机号则会自动注册</p>
          <input className={`${classPrefix}-container-phone`} placeholder='请输入手机号' ref={(el)=>this.phoneRef=el} />
          <input className={`${classPrefix}-container-pwd`} placeholder='设置密码' type='password' ref={(el)=>this.pwdRef=el} />
          <Button className={`${classPrefix}-container-submit`} onClick={this.login} loading={this.state.loading} >登 录</Button>
        </div>
      </div>
    );
  }
}

export default withRouter(Login);