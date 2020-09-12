// pages/letter/letter.js
import Toast from '../../miniprogram_npm/vant-weapp/toast/toast'
import api from '../../utils/api'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    letter: {
      openid: '',
      name: '',
      gender: '',
      school: '',
      classid: '',
      mobile: '',
      content: ''
    },
    tabIndex: 0,
    tabActive: 0,
    genderOpt: ['男', '女'],
    popupShow: false,
    isSubmited: false
  },

  // 弹出性别选择对话框
  handleGenderSelection: function(e) {
    if(this.data.isSubmited) return
    this.setData({
      popupShow: true
    })
  },

  // 性别选择确定
  handleGenderConfirm: function(e) {
    this.setData({
      'letter.gender': this.data.genderOpt[e.detail.index],
      popupShow: false
    })

  },

  //  性别选择取消
  handleGenderCancel: function(e) {
    this.setData({
      popupShow: false
    })
  },

  // 表单验证
  validate: function(values) {
    //  验证名字
    if (values.name.length < 1) {
      Toast.fail('名字不能为空')
      return false
    }
    
    //  验证性别
    if (values.gender.length < 1) {
      Toast.fail('性别不能为空')
      return false
    }

    //  验证学校
    if (values.school.length < 1) {
      Toast.fail('学校不能为空')
      return false
    }

    //  验证班级
    if (values.classid.length < 1) {
      Toast.fail('班级不能为空')
      return false
    }

    //  验证手机号
    const mobileReg = /^1[3456789]\d{9}$/
    if (!mobileReg.test(values.mobile)) {
      Toast.fail('手机格式不对')
      return false;
    }

    //  验证正文内容
    if (values.content.length < 20) {
      Toast.fail('正文内容应不小于20个字')
      return false
    }
    
    //  全部通过 返回 true
    return true
  },

  submit: function(e) {
    const { value: values } = e.detail
    if (this.validate(values)) {
      values.openid = wx.getStorageSync('openid')
      this.setData({
        letter: values
      })

      wx.showLoading({
        title: '提交中',
      })

      wx.request({
        url: api.addLetterUrl,
        method: 'POST',
        data: {
          'openid': values.openid,
          'name': values.name,
          'gender': values.gender,
          'school': values.school,
          'classid': values.classid,
          'mobile': values.mobile,
          'content': values.content
        },
        success: (result) => {
          if (result.data.meta.status !== 201) {
            Toast.fail('提交失败')
            return
          }
          wx.hideLoading()
          
          Toast.success('提交成功！')
          this.setData({
            isSubmited: true
          })
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  onChange(e) {
    const { index: tabIndex } = e.detail
    
    this.setData({
      tabIndex
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})