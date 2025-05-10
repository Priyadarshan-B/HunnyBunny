import React, { useEffect } from "react";
import { message } from "antd";

let messageApiRef = null;

const ToastMessage = () => {
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    messageApiRef = messageApi;
  }, [messageApi]);

  return <>{contextHolder}</>;
};

export const showSuccess = (content = "Success!", duration = 1.5) => {
  messageApiRef?.open({ type: "success", content, duration });
};

export const showError = (content = "Something went wrong!", duration = 1.5) => {
  messageApiRef?.open({ type: "error", content, duration });
};

export const showWarning = (content = "Warning!", duration = 1.5) => {
  messageApiRef?.open({ type: "warning", content, duration });
};

export default ToastMessage;
