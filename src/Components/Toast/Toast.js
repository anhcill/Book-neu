import { useCallback, useEffect } from 'react'
import './Toast.css'
import { useToast } from "../../Context/toast-context"

function Toast({ position })
{
    const { toastList, setToastList } = useToast()
    
    const deleteToast = useCallback((toastId) => {
        setToastList(prev => prev.filter(toast => toast.id !== toastId))
    }, [setToastList])
    
    useEffect(()=>{
        const interval = setInterval(()=>{
            if(toastList.length)
            {
                deleteToast(toastList[0].id)
            }
        },3000);

        return ()=> {
            clearInterval(interval)
        }
        
    },[toastList, deleteToast])

    return(
        <div className={`toasts-container ${position}`}>
            {
                toastList.map((toast) => (
                    <div key={toast.id}
                         className={`notification toast`}
                         style={{backgroundColor : toast.backgroundColor}}
                    >
                        <div className="toast-content-container">
                            <h3 className='toast-title'>{toast.title}</h3>
                            <p className='toast-description'>{toast.description}</p>
                        </div>
                        <button onClick={()=>deleteToast(toast.id)} className="toast-close-btn">X</button>
                    </div>
                ))
            }
        </div>
    )
}

export { Toast };