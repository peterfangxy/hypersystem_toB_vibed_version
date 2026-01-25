
export const translations = {
  en: {
    common: {
      actions: "Actions",
      edit: "Edit",
      delete: "Delete",
      cancel: "Cancel",
      save: "Save",
      processing: "Processing...",
      close: "Close",
      manage: "Manage",
      noData: "No data available"
    },
    sidebar: {
      dashboard: "Performance",
      members: "Members",
      tournaments: "Tournaments",
      structures: "Structures",
      tables: "Tables",
      clocks: "Clocks",
      settings: "Settings",
      floorManager: "Floor Manager",
      admin: "Admin"
    },
    members: {
      title: "Member Directory",
      subtitle: "Manage your club members and their status.",
      createBtn: "New Member",
      searchPlaceholder: "Search members by name, email or ID...",
      filterStatus: "Filter by Status",
      tabs: {
        manage: "Manage Members",
        settings: "Membership Settings"
      },
      settings: {
        comingSoon: "Coming Soon",
        comingSoonDesc: "Advanced membership configuration and tier management features are under development."
      },
      table: {
        member: "Member",
        email: "Email",
        phone: "Phone",
        clubId: "Club ID",
        tier: "Tier",
        status: "Status",
        joined: "Joined"
      },
      form: {
        titleEdit: "Edit Member",
        titleNew: "New Member Registration",
        personal: "Personal Information",
        fullName: "Full Name",
        nickname: "Nickname",
        age: "Age",
        gender: "Gender",
        contact: "Contact Information",
        email: "Email Address",
        phone: "Phone Number",
        membership: "Membership Details",
        clubId: "Club ID",
        tier: "Membership Tier",
        accountStatus: "Account Status",
        notes: "Notes",
        submitSave: "Save Changes",
        submitCreate: "Create Member"
      }
    },
    tables: {
      title: "Table Management",
      subtitle: "Overview of your poker tables and their status.",
      addBtn: "Add Table",
      removeConfirm: "Are you sure you want to delete this table?",
      newTable: "New Table",
      seats: "Seats",
      id: "ID",
      turnOff: "Turn Off",
      turnOn: "Turn On",
      form: {
        titleEdit: "Edit Table",
        titleNew: "Create New Table",
        name: "Table Name",
        status: "Status",
        capacity: "Capacity",
        notes: "Notes",
        submitSave: "Save Changes",
        submitCreate: "Create Table"
      }
    },
    tournaments: {
      title: "Tournaments",
      subtitle: "Manage your tournament schedule and templates.",
      btn: {
        createTemplate: "Create Template",
        createEvent: "Create Event"
      },
      tabs: {
        manage: "Manage Events",
        templates: "Templates"
      },
      filter: {
        searchTemplates: "Search templates...",
        search: "Search tournaments...",
        status: "Filter by Status"
      },
      table: {
        status: "Status",
        date: "Date",
        time: "Time",
        duration: "Duration",
        tournament: "Tournament",
        buyIn: "Buy-in",
        structure: "Structure",
        rebuys: "Rebuys",
        players: "Players",
        templateName: "Template Name",
        estDuration: "Est. Duration",
        payoutModel: "Payout Model",
        empty: "No tournaments found",
        createFirst: "Create your first tournament",
        emptyTemplates: "No templates found",
        createFirstTemplate: "Create your first template"
      },
      form: {
        titleEdit: "Edit Tournament",
        titleNew: "New Tournament",
        titleEditTemplate: "Edit Template",
        titleNewTemplate: "New Template",
        quickStart: "Quick Start",
        importTemplate: "Import settings from a template",
        selectTemplate: "Select a template...",
        generalInfo: "General Information",
        templateName: "Template Name",
        name: "Tournament Name",
        date: "Start Date",
        time: "Start Time",
        estDuration: "Est. Duration",
        status: "Status",
        description: "Description",
        structurePayouts: "Structure & Payouts",
        structure: "Blind Structure",
        selectStructure: "Select structure...",
        payoutModel: "Payout Model",
        selectPayout: "Select payout model...",
        clockLayout: "Clock Layout",
        selectTheme: "Select Theme",
        preview: "Preview",
        financials: "Financials",
        buyIn: "Buy-in",
        fee: "Fee",
        maxPlayers: "Max Players",
        assignTables: "Assign Tables",
        saveChanges: "Save Changes",
        createTemplate: "Create Template",
        create: "Create Tournament",
        readOnly: "Read Only ({status})"
      },
      detail: {
        searchPlayers: "Search players...",
        addPlayer: "Add Player",
        calculating: "Calculating Results...",
        verifying: "Verifying chip counts and payouts",
        table: {
          player: "Player",
          status: "Status",
          seat: "Seat",
          entries: "Entries",
          chipsIn: "Chips In",
          chipsOut: "Chips Out",
          winnings: "Winnings",
          manage: "Manage"
        },
        prizePool: "PRIZE POOL",
        houseFees: "HOUSE FEES",
        chipsInPlay: "CHIPS IN PLAY",
        chipsCounted: "CHIPS COUNTED",
        discrepancy: "DISCREPANCY",
        complete: "Complete Tournament"
      }
    },
    structures: {
      title: "Structures & Payouts",
      subtitle: "Configure blind levels and payout structures.",
      btn: {
        createStructure: "New Structure",
        createMatrix: "New Matrix"
      },
      tabs: {
        blinds: "Blind Structures",
        payouts: "Payout Models"
      },
      blindsTable: {
        empty: "No structures defined",
        createFirst: "Create your first blind structure",
        name: "Name",
        chips: "Starting Chips",
        blinds: "Starting Blinds",
        levels: "Levels",
        rebuys: "Rebuys",
        length: "Est. Length"
      },
      payouts: {
        algorithms: "Algorithms",
        matrices: "Custom Matrices",
        table: {
          name: "Name",
          rules: "Rules",
          range: "Player Range",
          ranges: "Ranges",
          noRules: "No rules defined",
          empty: "No custom payout matrices defined."
        }
      },
      form: {
        editTitle: "Edit Structure",
        createTitle: "Create Structure",
        name: "Structure Name",
        chips: "Chips",
        startChips: "Starting Chips",
        rebuys: "Rebuys",
        rebuyLimit: "Rebuy Limit",
        freezeout: "0 = Freezeout",
        lastRebuyLevel: "Last Rebuy Level",
        estLength: "EST. LENGTH",
        schedule: {
          headerSeq: "#",
          headerDur: "Duration (min)",
          headerSmall: "Small Blind",
          headerBig: "Big Blind",
          headerAnte: "Ante",
          headerActions: "Actions",
          addLevel: "Add Level",
          addBreak: "Add Break"
        },
        save: "Save Structure",
        create: "Create Structure"
      },
      payoutForm: {
        editTitle: "Edit Payout Model",
        createTitle: "Create Payout Model",
        name: "Model Name",
        desc: "Description",
        rules: "Payout Rules",
        addRange: "Add Range",
        rangeLabel: "PLAYER RANGE (MIN - MAX)",
        placesLabel: "PLACES PAID",
        distributionLabel: "DISTRIBUTION %",
        total: "Total",
        noRules: "No rules added yet. Click 'Add Range' to start.",
        validation: {
          valid: "Structure Valid",
          sum: "Percentages must sum to 100%",
          minMax: "Min players cannot be greater than Max players",
          descending: "Payouts must be in descending order",
          overlap: "Ranges overlap",
          gap: "Gap between ranges"
        },
        save: "Save Model",
        create: "Create Model"
      }
    },
    clocks: {
      title: "Clocks",
      subtitle: "Launch tournament clocks and monitor active tables.",
      tabs: {
        tournaments: "Tournaments",
        tables: "Tables",
        layouts: "Layouts"
      },
      empty: {
        noTournaments: "No Active Tournaments",
        noTournamentsDesc: "There are no tournaments currently in progress or registration.",
        noTables: "No Tables Configured",
        noTablesDesc: "Please configure tables in the Tables section first.",
        title: "Create Layout",
        subtitle: "Design a new clock screen"
      },
      live: {
        assignedTo: "ASSIGNED TO",
        idle: "IDLE",
        duplicate: "Duplicate Active Tournaments",
        duplicateDesc: "This table is assigned to multiple active tournaments. Please resolve the conflict in Tournaments settings."
      },
      btn: {
        new: "New Layout"
      },
      card: {
        activeWidgets: "Active Widgets"
      },
      editor: {
        headerName: "Layout Name",
        grid: "Grid",
        snap: "Snap",
        save: "Save Layout",
        description: "DESCRIPTION",
        addWidget: "Add Widget",
        emptyWidgets: "No widgets added. Click 'Add Widget' to start.",
        properties: "PROPERTIES",
        background: "BACKGROUND COLOR",
        textColor: "DEFAULT TEXT COLOR",
        content: "CONTENT",
        labelText: "LABEL TEXT",
        appearance: "APPEARANCE",
        typography: "TYPOGRAPHY",
        fillColor: "FILL COLOR",
        fontColor: "FONT COLOR",
        size: "SIZE (PX)",
        width: "WIDTH (PX)",
        height: "HEIGHT (PX)",
        position: "POSITION",
        displayOrder: "DISPLAY ORDER",
        duplicate: "Duplicate",
        remove: "Remove"
      },
      widgets: {
        tournament_name: "Tournament Name",
        tournament_desc: "Description",
        timer: "Main Timer",
        blind_countdown: "Level Countdown",
        blind_level: "Current Blinds",
        next_blinds: "Next Blinds",
        ante: "Ante",
        next_ante: "Next Ante",
        starting_chips: "Starting Chips",
        rebuy_limit: "Rebuy Limit",
        players_count: "Players Count",
        entries_count: "Total Entries",
        total_chips: "Total Chips",
        avg_stack: "Avg Stack",
        payout_total: "Total Payout",
        next_break: "Next Break",
        current_time: "Real Time",
        current_date: "Current Date",
        start_time: "Start Time",
        start_date: "Start Date",
        est_end_time: "Est. End Time",
        custom_text: "Custom Text",
        line: "Line / Divider",
        shape_rect: "Rectangle",
        shape_circle: "Circle",
        shape_triangle: "Triangle",
        image: "Image"
      }
    },
    settings: {
      title: "Club Settings",
      subtitle: "Manage your club configuration and team access.",
      saved: "Saved!",
      tabs: {
        general: "General",
        team: "Team & Access",
        appearance: "Appearance"
      },
      general: {
        title: "Club Information",
        clubName: "Club Name",
        logoUrl: "Logo URL",
        contactTitle: "Contact Details",
        address: "Address",
        email: "Email",
        phone: "Phone",
        save: "Save Changes"
      },
      team: {
        title: "Team Members",
        subtitle: "Manage staff access and roles.",
        invite: "Invite Member",
        activeNow: "Active Now",
        invitePending: "Invite Pending",
        confirmRemove: "Are you sure you want to remove this user?",
        accessControlTitle: "Access Control",
        accessControlText: "Roles determine what modules users can view or edit."
      },
      appearance: {
        title: "Theme & Branding",
        subtitle: "Customize the look and feel of your dashboard.",
        reset: "Reset to Default",
        brandColors: "BRAND COLORS",
        primaryAccent: "Primary Accent",
        primaryAccentDesc: "Buttons, highlights, active states",
        appBackground: "App Background",
        appBackgroundDesc: "Main application background",
        cardSurface: "Card Surface",
        cardSurfaceDesc: "Panels, modals, list items",
        typography: "TYPOGRAPHY & BORDERS",
        primaryText: "Primary Text",
        primaryTextDesc: "Headings, main content",
        secondaryText: "Secondary Text",
        secondaryTextDesc: "Subtitles, labels, hints",
        borderColor: "Border Color",
        borderColorDesc: "Dividers, inputs, cards",
        previewTitle: "PREVIEW",
        previewButton: "Button",
        previewBadge: "Badge",
        previewBordered: "Bordered",
        previewSecondary: "Secondary Text",
        save: "Save Theme"
      }
    },
    performance: {
      title: "Performance",
      subtitle: "Overview of your club's activity.",
      tabs: {
        overview: "Overview",
        export: "Data Export"
      },
      export: {
        comingSoon: "Coming Soon",
        comingSoonDesc: "Advanced reporting and CSV export features are under development."
      }
    }
  },
  zh: {
    widgets: {
      tournament_name: "赛事名称",
      tournament_desc: "描述",
      timer: "主计时器",
      blind_countdown: "级别倒计时",
      blind_level: "当前盲注",
      next_blinds: "下级盲注",
      ante: "前注",
      next_ante: "下级前注",
      starting_chips: "起始筹码",
      rebuy_limit: "重购限制",
      players_count: "玩家人数",
      entries_count: "总买入数",
      total_chips: "总筹码量",
      avg_stack: "平均筹码",
      payout_total: "总奖池",
      next_break: "下次休息",
      current_time: "实时时间",
      current_date: "当前日期",
      start_time: "开始时间",
      start_date: "开始日期",
      est_end_time: "预计结束",
      custom_text: "自定义文本",
      line: "线条 / 分隔符",
      shape_rect: "矩形",
      shape_circle: "圆形",
      shape_triangle: "三角形",
      image: "图片"
    }
  }
};