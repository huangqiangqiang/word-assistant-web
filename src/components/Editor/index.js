import * as React from 'react';
import './index.less';
import { Button, message, Divider } from 'antd';
import HttpTool from '../../utils/HttpTool';
import SimpleMDE from 'simplemde';
import Modal from '../../utils/QWModal';

const classPrefix = 'Editor';

class Editor extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
    const mde = new SimpleMDE({ element: this.editer });
    this.setState({ mde });
  }

  handleOk = () => {
    this.setState({
      loading: true,
    });
    HttpTool.editWords({
      text: this.props.word.text,
      content: this.state.mde.value(),
    }, (res)=>{
      console.log(res);
      this.setState({
        loading: false,
      });
      if (res.data.status === 1) {
        message.success('操作成功！');
        this.props.handleEditSuccess && this.props.handleEditSuccess(res.data.data);
        this.handleCancel();
      } else {
        message.error(res.data.message);
      }
    }, (e)=>{
      this.setState({
        loading: false,
      });
      message.error('服务器异常，请稍后再试！');
    });
  }

  handleCancel = () => {
    this.props.onClose && this.props.onClose();
  }

  componentWillReceiveProps(nextProps) {
    const { visible, word } = nextProps;
    if (visible && this.state.mde && word.extends) {
      this.state.mde.toTextArea();
      this,this.setState({
        mde: null,
      }, ()=>{
        const mde = new SimpleMDE({ element: this.editer });
        console.log(mde.isPreviewActive());
        mde.value(word.extends);
        this.setState({ mde });
      });
    }
  }

  render() {
    const { visible, word } = this.props;
    return (
      <div className={classPrefix}>
        <Modal
          className={`${classPrefix}-modal`}
          visible={visible}
        >
          <div className={`${classPrefix}-QWModal-header`}>
            {word ? word.text : 'null'}
          </div>
          <div className={`${classPrefix}-QWModal-content`}>
            <textarea ref={(el)=>{this.editer=el;}} />
          </div>
          <Divider></Divider>
          <div className={`${classPrefix}-QWModal-footer`}>
            <Button className={`${classPrefix}-QWModal-button`} onClick={this.handleCancel}>取消</Button>
            <Button className={`${classPrefix}-QWModal-button`} loading={this.state.loading} onClick={this.handleOk}>确定</Button>
          </div>
        </Modal>
      </div>
    );
  }
}


export default Editor;