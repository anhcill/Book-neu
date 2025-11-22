import React from 'react'
import './Contact.css'

const Contact = () => {
  return (
    <div className="page-container contact-page">
      <h1>Liên hệ</h1>
      <p>Người liên hệ: <strong>Lê Đức Anh (Neu)</strong></p>
      <p>Số điện thoại: <strong>0815913408</strong></p>
      <p>Instagram: <a href="https://www.instagram.com/anhcill" target="_blank" rel="noreferrer">@anhcill</a></p>
      <p>Email: <em>contact@neubook.example</em></p>
      <p>Nếu bạn có câu hỏi, hãy gửi tin nhắn hoặc gọi trực tiếp. Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
    </div>
  )
}

export default Contact
