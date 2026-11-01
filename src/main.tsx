import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

// Обработка ошибок загрузки модулей
window.addEventListener('error', (event) => {
  const target = event.target as HTMLElement;
  
  // Проверяем, является ли ошибка загрузкой скрипта или стиля
  if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
    const src = (target as HTMLScriptElement).src || (target as HTMLLinkElement).href;
    
    // Показываем понятное сообщение пользователю
    if (src && (src.includes('.js') || src.includes('.css'))) {
      event.preventDefault();
      
      // Создаем оверлей с сообщением
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      `;
      
      const content = document.createElement('div');
      content.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        padding: 40px;
        max-width: 500px;
        text-align: center;
        color: white;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      `;
      
      content.innerHTML = `
        <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
        <h1 style="font-size: 24px; margin-bottom: 16px; font-weight: 600;">
          Приложение обновляется
        </h1>
        <p style="font-size: 16px; margin-bottom: 24px; opacity: 0.9; line-height: 1.5;">
          Некоторые компоненты приложения были обновлены. Пожалуйста, перезагрузите страницу, чтобы загрузить новую версию.
        </p>
        <button onclick="window.location.reload()" style="
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          padding: 12px 32px;
          font-size: 16px;
          color: white;
          cursor: pointer;
          font-weight: 500;
        ">
          Перезагрузить страницу
        </button>
        <p style="font-size: 12px; margin-top: 20px; opacity: 0.7;">
          Это происходит после обновления приложения и является нормальным поведением.
        </p>
      `;
      
      overlay.appendChild(content);
      document.body.appendChild(overlay);
    }
  }
}, true);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
