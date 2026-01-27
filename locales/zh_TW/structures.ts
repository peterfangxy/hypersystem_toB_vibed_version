
export default {
  "title": "結構與獎勵",
  "subtitle": "設定盲注級別與獎勵結構。",
  "btn": {
    "createStructure": "新增結構",
    "createMatrix": "新增矩陣",
    "createModel": "新增模型"
  },
  "tabs": {
    "blinds": "盲注結構",
    "payouts": "獎勵模型"
  },
  "blindsTable": {
    "empty": "尚未定義結構",
    "createFirst": "建立您的第一個盲注結構",
    "name": "名稱",
    "chips": "起始籌碼",
    "blinds": "起始盲注",
    "levels": "級別數",
    "rebuys": "重購",
    "length": "預計長度",
    "deleteTitle": "刪除結構？"
  },
  "payouts": {
    "algorithms": "演算法",
    "matrices": "自訂矩陣",
    "deleteTitle": "刪除獎勵模型？",
    "table": {
      "name": "名稱",
      "splits": "結構",
      "rules": "規則",
      "range": "玩家範圍",
      "ranges": "範圍",
      "noRules": "未定義規則",
      "empty": "未定義自訂獎勵矩陣。",
      "emptySplits": "無內容"
    }
  },
  "form": {
    "editTitle": "編輯結構",
    "createTitle": "建立結構",
    "name": "結構名稱",
    "chips": "籌碼",
    "startChips": "起始籌碼",
    "rebuys": "重購",
    "rebuyLimit": "重購限制",
    "freezeout": "0 = 凍結 (Freezeout)",
    "lastRebuyLevel": "最後重購級別",
    "estLength": "預計長度",
    "schedule": {
      "headerSeq": "#",
      "headerDur": "時間 (分)",
      "headerSmall": "小盲",
      "headerBig": "大盲",
      "headerAnte": "前注",
      "headerActions": "操作",
      "addLevel": "新增級別",
      "addBreak": "新增休息"
    },
    "save": "儲存結構",
    "create": "建立結構",
    "placeholders": {
        "name": "例如：快速深籌碼"
    }
  },
  "payoutForm": {
    "editTitle": "編輯獎勵模型",
    "createTitle": "建立獎勵模型",
    "name": "模型名稱",
    "desc": "描述",
    "rules": "獎勵規則",
    "addRange": "新增範圍",
    "rangeLabel": "玩家範圍 (最少 - 最多)",
    "placesLabel": "獲獎名次",
    "distributionLabel": "分配比例 %",
    "total": "總計",
    "noRules": "尚未新增規則。點擊「新增範圍」開始。",
    "validation": {
      "valid": "結構有效",
      "sum": "百分比總和必須為 100%",
      "minMax": "最少玩家數不能大於最多玩家數",
      "descending": "獎勵必須為遞減排序",
      "overlap": "範圍重疊",
      "gap": "範圍之間有空隙",
      "nameRequired": "名稱為必填",
      "totalMustBe100": "總計：{{total}}% (必須為 100%)",
      "invalidFormat": "格式無效：缺少 'allocations' 陣列。",
      "allocationError": "{{name}}：{{error}}"
    },
    "save": "儲存模型",
    "create": "建立模型",
    "importJson": "匯入 JSON",
    "exportJson": "匯出 JSON",
    "exportTitle": "匯出獎勵模型",
    "importTitle": "匯入獎勵模型",
    "splits": "分配結構",
    "addSplit": "新增",
    "direct": "直接分配",
    "selectSplitPrompt": "請選擇一個分配結構以進行設定",
    "allocationName": "分配名稱",
    "method": "計算方式",
    "placesPaid": "獲獎名次",
    "chipEvTitle": "Chip EV 引擎",
    "chipEvDesc": "此部分 ({{percent}}%) 的獎勵將根據籌碼比例直接計算。",
    "hiddenConfig": "為保持效能，超過 50 名的分配設定已隱藏。",
    "defaultSplitName": "結構",
    "placeholders": {
        "name": "例如：標準前 15%",
        "description": "描述..."
    }
  }
};