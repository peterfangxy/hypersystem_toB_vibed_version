
export default {
  "title": "會員名冊",
  "subtitle": "管理您的俱樂部會員及其狀態。",
  "createBtn": "新增會員",
  "searchPlaceholder": "搜尋會員姓名、Email 或 ID...",
  "filterStatus": "依狀態篩選",
  "tabs": {
    "manage": "管理會員",
    "settings": "會員設定"
  },
  "settings": {
    "comingSoon": "即將推出",
    "comingSoonDesc": "進階會員配置與等級管理功能正在開發中。",
    "addTier": "新增等級",
    "tierCard": {
      "requirements": "資格要求",
      "benefits": "權益福利",
      "noBenefits": "未列出福利。",
      "deleteConfirm": "確定要刪除此等級嗎？現有會員可能需要重新分配。"
    }
  },
  "tierForm": {
    "newTitle": "新增等級",
    "editTitle": "編輯等級: {{name}}",
    "name": "顯示名稱",
    "color": "顏色",
    "requirements": "資格要求",
    "benefits": "等級權益 (員工備註)",
    "save": "儲存等級",
    "placeholders": {
        "name": "例如：鑽石精英",
        "requirements": "例如：每年 5,000 點",
        "benefits": "- 每週賽事免費入場\n- 優先候補資格\n- 餐飲 8 折優惠"
    }
  },
  "table": {
    "member": "會員",
    "email": "Email",
    "phone": "電話",
    "clubId": "會員 ID",
    "tier": "會員等級",
    "noTier": "無",
    "status": "狀態",
    "joined": "加入日期",
    "verified": "驗證"
  },
  "statusOption": {
    "pending": "待審核",
    "activated": "已啟用",
    "deactivated": "已停用"
  },
  "form": {
    "titleEdit": "編輯會員",
    "titleNew": "新增會員註冊",
    "personal": "個人資訊",
    "fullName": "全名",
    "nickname": "暱稱",
    "age": "年齡",
    "gender": "性別",
    "contact": "聯絡資訊",
    "email": "Email 地址",
    "phone": "電話號碼",
    "membership": "會籍詳情",
    "clubId": "會員 ID",
    "tier": "會員等級",
    "accountStatus": "帳號狀態",
    "notes": "備註",
    "placeholders": {
        "notes": "(選填)"
    },
    "submitSave": "儲存變更",
    "submitCreate": "建立會員",
    "genderOptions": {
        "male": "男性",
        "female": "女性",
        "other": "其他",
        "preferNotToSay": "不願透露"
    },
    "noTier": "未分配等級",
    "identity": {
        "title": "身分驗證",
        "required": "(必填)",
        "verified": "ID 已驗證",
        "idNumber": "身分證字號",
        "passportNumber": "護照號碼",
        "idPhotos": "證件照片",
        "frontId": "正面 ID",
        "backId": "背面 ID",
        "notVerified": "未驗證"
    },
    "deactivate": {
        "title": "確認停用",
        "warning": "停用帳號？",
        "message": "這將立即限制該會員參加比賽和使用俱樂部設施的權限。\n\n如要確認，請在下方輸入 YES。",
        "confirmPlaceholder": "YES",
        "confirmBtn": "確認",
        "cancelBtn": "取消",
        "buttonLabel": "停用帳號",
        "reactivateLabel": "重新啟用"
    },
    "activateBtn": "啟用會員"
  },
  "wallet": {
    "title": "錢包與財務",
    "winnings": "總獎金",
    "deposits": "總存款",
    "withdrawn": "已提款",
    "available": "可用餘額",
    "activityLog": "活動記錄",
    "deposit": "存款",
    "withdraw": "提款",
    "amount": "金額",
    "method": "方式",
    "note": "備註",
    "optional": "(選填)",
    "confirmDeposit": "確認存款",
    "confirmWithdrawal": "確認提款",
    "success": "交易完成",
    "successMsg": {
        "deposit": "成功存款 ${{amount}}",
        "withdraw": "成功提款 ${{amount}}"
    },
    "methods": {
        "cash": "現金",
        "bankTransfer": "銀行轉帳",
        "crypto": "加密貨幣"
    },
    "history": {
        "deposit": "存款",
        "withdrawal": "提款",
        "win": "獲勝",
        "buyIn": "買入"
    },
    "emptyHistory": "找不到交易記錄。",
    "back": "返回",
    "fundsDeposited": "存款資金",
    "fundsWithdrawn": "提款資金"
  }
};
