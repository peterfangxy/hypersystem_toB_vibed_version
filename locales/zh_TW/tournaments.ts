
export default {
  "title": "賽事管理",
  "subtitle": "管理您的賽事行程與範本。",
  "btn": {
    "createTemplate": "建立範本",
    "createEvent": "建立賽事"
  },
  "tabs": {
    "manage": "管理賽事",
    "templates": "範本"
  },
  "filter": {
    "searchTemplates": "搜尋範本...",
    "search": "搜尋賽事...",
    "status": "依狀態篩選"
  },
  "statusOption": {
    "scheduled": "已排程",
    "registration": "開放報名",
    "inProgress": "進行中",
    "completed": "已結束",
    "cancelled": "已取消"
  },
  "registrationStatus": {
    "reserved": "預約",
    "joined": "已加入",
    "cancelled": "已取消",
    "waitlist": "候補中"
  },
  "addPlayerModal": {
    "title": "新增玩家",
    "searchPlaceholder": "搜尋可用會員...",
    "noResults": "找不到可用會員",
    "headers": {
        "member": "會員",
        "id": "ID",
        "contact": "聯絡資訊",
        "action": "操作"
    }
  },
  "buyinModal": {
    "title": "費用明細",
    "headers": {
      "time": "時間",
      "type": "類型",
      "base": "基數",
      "rebuy": "重購折扣",
      "member": "會員折扣",
      "voucher": "優惠券",
      "campaign": "活動折扣",
      "deposit": "預存扣款",
      "cash": "現金",
      "net": "應付",
      "paid": "已付"
    },
    "types": {
      "buyIn": "買入",
      "reBuy": "重入"
    },
    "empty": "無交易記錄。請點擊下方「新增」。",
    "addBtn": "新增",
    "limitReached": "已達賽事上限 (最大 {{max}})",
    "summary": {
      "net": "總應付金額",
      "totalCash": "總現金",
      "deposit": "預存已扣",
      "outstanding": "待支付",
      "avail": "可用"
    },
    "validation": {
        "exceedsPayable": "超過應付金額",
        "markAllPaid": "* 必須將所有項目標記為已付款才能儲存",
        "invalidDeposit": "* 預存扣款不能超過應付金額",
        "insufficientBalance": "* 錢包餘額不足",
        "allEntriesPaidTooltip": "必須將所有項目標記為已付款",
        "invalidDepositTooltip": "預存金額無效"
    },
    "save": "儲存變更"
  },
  "signatureModal": {
    "title": "籌碼確認",
    "confirmText": "本人 <bold>{{name}}</bold> 確認剩餘籌碼為 <bold>{{chips}}</bold>。",
    "instruction": "請在下方簽名以驗證此金額。",
    "placeholder": "在此簽名",
    "clear": "清除簽名",
    "confirm": "確認簽名"
  },
  "table": {
    "status": "狀態",
    "date": "日期",
    "time": "時間",
    "duration": "時間",
    "tournament": "賽事",
    "buyIn": "買入",
    "structure": "結構",
    "rebuys": "重購",
    "players": "玩家",
    "templateName": "範本名稱",
    "estDuration": "預計時間",
    "payoutModel": "獎勵模式",
    "empty": "找不到賽事",
    "createFirst": "建立您的第一個賽事",
    "emptyTemplates": "找不到範本",
    "createFirstTemplate": "建立您的第一個範本"
  },
  "form": {
    "titleEdit": "編輯賽事",
    "titleNew": "新增賽事",
    "titleEditTemplate": "編輯範本",
    "titleNewTemplate": "新增範本",
    "quickStart": "快速開始",
    "importTemplate": "從範本匯入設定",
    "selectTemplate": "選擇範本...",
    "generalInfo": "基本資訊",
    "templateName": "範本名稱",
    "name": "賽事名稱",
    "date": "開始日期",
    "time": "開始時間",
    "estDuration": "預計時間",
    "status": "狀態",
    "description": "描述",
    "structurePayouts": "結構與獎勵",
    "structure": "盲注結構",
    "selectStructure": "選擇結構...",
    "payoutModel": "獎勵模式",
    "selectPayout": "選擇獎勵模式...",
    "clockLayout": "計時器版面",
    "selectTheme": "選擇主題",
    "preview": "預覽",
    "financials": "財務設定",
    "buyIn": "買入",
    "fee": "手續費",
    "maxPlayers": "最大玩家數",
    "assignTables": "分配牌桌",
    "saveChanges": "儲存變更",
    "createTemplate": "建立範本",
    "create": "建立賽事",
    "readOnly": "唯讀 ({status})",
    "placeholders": {
        "name": "例如：週六狂歡夜",
        "templateName": "例如：每週深籌碼範本",
        "description": "賽事詳情..."
    },
    "structureCard": {
        "chips": "起始籌碼",
        "blinds": "起始盲注",
        "rebuys": "重購限制"
    }
  },
  "detail": {
    "searchPlayers": "搜尋玩家...",
    "addPlayer": "新增玩家",
    "calculating": "計算結果中...",
    "verifying": "驗證籌碼與獎勵",
    "table": {
      "player": "玩家",
      "status": "狀態",
      "seat": "座位",
      "entries": "買入次數",
      "chipsIn": "籌碼買入",
      "chipsOut": "籌碼結算",
      "winnings": "獎金",
      "manage": "管理"
    },
    "prizePool": "總獎池",
    "houseFees": "服務費",
    "chipsInPlay": "總籌碼",
    "chipsCounted": "結算籌碼",
    "discrepancy": "差異",
    "complete": "完成賽事"
  }
};
