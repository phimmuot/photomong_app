import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import i18n from '../../translations/i18n';
import "../../css/Payment.css";
import QRCode from 'qrcode.react';

// Go Back
import goback_en from '../../assets/Common/goback.png';
import goback_en_hover from '../../assets/Common/gobackhover.png';
import goback_kr from '../../assets/Common/kr/goback.png';
import goback_kr_hover from '../../assets/Common/kr/gobackhover.png';
import goback_vn from '../../assets/Common/vn/goback.png';
import goback_vn_hover from '../../assets/Common/vn/gobackhover.png';
import goback_mn from '../../assets/Common/mn/goback.png';
import goback_mn_hover from '../../assets/Common/mn/gobackhover.png';
// Background
import background_en from '../../assets/Payment/QR/BG.png';
import background_vn from '../../assets/Payment/QR/vn/BG.png';
import background_kr from '../../assets/Payment/QR/kr/BG.png';
import background_mn from '../../assets/Payment/QR/mn/BG.png';
import { getAudio, getClickAudio } from '../../api/config';

function QR() {
     const { t } = useTranslation();
     const navigate = useNavigate();
     const [hoveredImage, setHoveredImage] = useState(null);
     const [qrCode, setQrCode] = useState(null);
     const [orderCode, setOrderCode] = useState(null);
     const [paymentStatus, setPaymentStatus] = useState(null);
     const [goBackBg, setGoBackBg] = useState([]);
     const [background, setBackground] = useState(background_en);
     const playAudio = async() => {
          const res=await getAudio({file_name:"scan_qr.wav"})
            }
      useEffect(()=>{
      playAudio()
      },[])
     useEffect(() => {
          const storedLanguage = sessionStorage.getItem('language');
          if (storedLanguage === 'ko') {
               setGoBackBg(goback_kr);
               setBackground(background_kr);
          } else if (storedLanguage === 'vi') {
               setGoBackBg(goback_vn);
               setBackground(background_vn);
          }
          else if (storedLanguage === 'mn') {
               setGoBackBg(goback_mn);
               setBackground(background_mn);
          }
          else {
               setGoBackBg(goback_en);
               setBackground(background_en);
          }
     })
     useEffect(() => {
          const fetchQRPayment = async () => {
               try {
                    const deviceNumber = process.env.REACT_APP_DEVICE_NUMBER;
                    const framePrice = sessionStorage.getItem('framePrice');
                    const method=sessionStorage.getItem("payMethod")
                    const response = await fetch(`${process.env.REACT_APP_BACKEND}/${method}/api?device=${deviceNumber}&amount=${framePrice}`);
                    const qrCodeData = await response.json();
                    setQrCode(qrCodeData.qr_code);
                    setOrderCode(qrCodeData.order_code);

                    if (qrCodeData.return_code == 1) {
                         setPaymentStatus(qrCodeData.status);
                    }
               } catch (error) {
                    console.error(error);
               }
          }

          fetchQRPayment();
     }, [])

     useEffect(() => {
          const checkPaymentStatus = async (orderCodeNum) => {
               try {
                    const response = await fetch(`${process.env.REACT_APP_BACKEND}/zalopay/api/webhook?order=${orderCodeNum}`);
                    const paymentData = await response.json();
                    if (paymentData.status === "Success") {
                         clearInterval(intervalId);
                         navigate("/payment-result");
                    }
               } catch (error) {
                    console.error(error);
               }
          };

          const intervalId = setInterval(() => {
               if (orderCode) {
                    checkPaymentStatus(orderCode);
               }
          }, 8000);

          return () => {
               clearInterval(intervalId);
          }
     })

     useEffect(() => {
          if (paymentStatus === 'Success') {
               navigate("/payment-result"); // Redirect to the next page
          }
     }, [paymentStatus]);

     const handleMouseEnter = (image) => {
          setHoveredImage(image);
     }

     const handleMouseLeave = () => {
          setHoveredImage(null);
     }

     const goBack = () => {
          getClickAudio()
          navigate("/payment");
     }

     const hoverGoBackButton = () => {
          setGoBackBg([goback_en_hover, goback_en_hover]);
     }
     return (
          <div className='qr-container' style={{ backgroundImage: `url(${background})` }}>
               <div className='qr-code'>
               {qrCode && <QRCode value={qrCode} size={200}/>}
               </div>
               <div className="go-back" style={{ backgroundImage: `url(${goBackBg})` }} onClick={goBack} ></div>
          </div>
     );
}

export default QR;