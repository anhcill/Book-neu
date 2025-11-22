import { useTranslation } from 'react-i18next';
import React from 'react'
import "./Footer.css"
import { Link } from "react-router-dom"

function Footer() {
    const { t } = useTranslation();
    return (
        <div className='footer-container'>
            <ul className='footer-list'>
                <li><h2>{t('about')}</h2></li>
                <li><Link to="/contact"><p>{t('contactUs')}</p></Link></li>
                <li><Link to="/about"><p>{t('aboutUs')}</p></Link></li>
                <li><Link to="/careers"><p>{t('careers')}</p></Link></li>
                <li><Link to="/gift-cards"><p>{t('giftCards')}</p></Link></li>
            </ul>
            <ul className='footer-list'>
                <li><h2>{t('help')}</h2></li>
                <li><Link to="/faq"><p>{t('payments')}</p></Link></li>
                <li><Link to="/faq"><p>Giao hàng</p></Link></li>
                <li><Link to="/faq"><p>Hủy đơn & Trả hàng</p></Link></li>
                <li><Link to="/faq"><p>Câu hỏi thường gặp</p></Link></li>

            </ul>
            <ul className='footer-list'>
                <li><h2>{t('socials')}</h2></li>
                <li>
                    <a href="https://www.linkedin.com/in/naman-saxena-5460b3188/" rel="noreferrer" target="_blank">
                        <p>Linkedin</p>
                    </a>
                </li>
                <li>
                    <a href="https://github.com/Naman-Saxena1" rel="noreferrer" target="_blank">
                        <p>Github</p>
                    </a>
                </li>
                <li>
                    <a href="https://twitter.com/NamanSa83962307?s=08" rel="noreferrer" target="_blank">
                        <p>Twitter</p>
                    </a>
                </li>
                <li>
                    <a href="https://www.instagram.com/anhcill" rel="noreferrer" target="_blank">
                        <p>Instagram</p>
                    </a>
                </li>
            </ul>
        </div>
    )
}

export { Footer } 