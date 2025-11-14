import globals from "globals";
import js from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintPluginHtml from "eslint-plugin-html"; // Ensure this is imported if you use it

export default [
  // Global ignores configuration
  {
    ignores: [
      "node_modules/**",
      "ARCHIVE/**",
      "gh-pages-local/**",
      "docs/**",
      "test/**",
      "OBJECTIVE-2025.05.30.8h23/**",
      "OBJECTIVE 4011/**",
      "OBJECTIVE 4011RF/**",
    ],
  },

  // Base ESLint recommended configuration
  js.configs.recommended,

  // Configuration for HTML files (if you want to lint script tags)
  // Consider if this is still needed if problematic HTML files are ignored.
  {
    files: ["**/*.html"],
    plugins: {
      html: eslintPluginHtml,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        TEUI: "readonly",
        capacitanceValue: "readonly",
      },
    },
    settings: {
      "html/indent": "auto", // "auto" or specific spaces/tabs, e.g. "+2" for 2 spaces
      "html/report-bad-indent": "warn",
      "html/javascript-mime-types": [
        "text/javascript",
        "application/javascript",
      ], // Ensure this includes all relevant types
      "html/xml-extensions": [".xhtml"], // Add other XML-like extensions if needed
    },
    rules: {
      "no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "after-used",
          caughtErrors: "all",
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Add HTML specific rules or overrides here if necessary
      // e.g. "no-undef": "off" for HTML if too many issues with script scopes
    },
  },

  // Custom configuration for JavaScript files
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"], // Specify which files this configuration applies to
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        // Add project-specific globals
        TEUI: "readonly",
        OBC: "writable", // OBC Matrix global object
        d3: "readonly",
        XLSX: "readonly",
        bootstrap: "readonly",
        dagre: "readonly",
        // Add other known global variables here from the previous step:
        createLabel: "readonly",
        createValueDisplay: "readonly",
        createDropdown: "readonly",
        createSlider: "readonly",
        createTooltip: "readonly",
        createUValueInput: "readonly",
        createPercentageInput: "readonly",
        populateDropdown: "readonly",
        getDropdownValue: "readonly",
        setDropdownValue: "readonly",
        getValue: "readonly", // Was identified in StateManager
        setValue: "readonly", // Was identified in StateManager
        addChangeListener: "readonly",
        triggerRecalculation: "readonly",
        updateUI: "readonly",
        validateField: "readonly",
        resetSection: "readonly",
        loadSectionData: "readonly",
        saveSectionData: "readonly",
        getFieldValue: "readonly",
        setFieldValue: "readonly",
        parseNumeric: "readonly",
        formatNumber: "readonly",
        setCalculatedValue: "readonly",
        handleFieldBlur: "readonly",
        setElementClass: "readonly",
        setIndicatorClass: "readonly",
        calculateHeatLoss: "readonly",
        calculateHeatGain: "readonly",
        calculateComponentRow: "readonly",
        calculateSubtotalRow: "readonly",
        calculateTotalRow: "readonly",
        initializeSection: "readonly",
        registerSectionModule: "readonly",
        getElement: "readonly",
        getNumericFieldValue: "readonly",
        getTextAreaValue: "readonly",
        setTextAreaValue: "readonly",
        getSelectValue: "readonly",
        setSelectValue: "readonly",
        getSliderValue: "readonly",
        setSliderValue: "readonly",
        addClass: "readonly",
        removeClass: "readonly",
        toggleClass: "readonly",
        showElement: "readonly",
        hideElement: "readonly",
        toggleElementVisibility: "readonly",
        displayError: "readonly",
        clearError: "readonly",
        loadData: "readonly",
        saveData: "readonly",
        exportData: "readonly",
        importData: "readonly",
        initTooltips: "readonly", // TEUI.Tooltips.init
        updateTooltip: "readonly",
        showModal: "readonly", // TEUI.Modal.show
        hideModal: "readonly", // TEUI.Modal.hide
        confirmAction: "readonly",
        showAlert: "readonly",
        debounce: "readonly",
        throttle: "readonly",
        isEmpty: "readonly",
        isNumeric: "readonly",
        isValidEmail: "readonly",
        isValidURL: "readonly",
        sanitizeHTML: "readonly",
        escapeHTML: "readonly",
        unescapeHTML: "readonly",
        deepClone: "readonly",
        mergeObjects: "readonly",
        generateUUID: "readonly",
        formatDate: "readonly",
        relativeTime: "readonly",
        getURLParameter: "readonly",
        setURLParameter: "readonly",
        removeURLParameter: "readonly",
        updateURL: "readonly",
        getQueryString: "readonly",
        parseQueryString: "readonly",
        serializeQueryString: "readonly",
        getCookie: "readonly",
        setCookie: "readonly",
        deleteCookie: "readonly",
        localStorageGet: "readonly",
        localStorageSet: "readonly",
        localStorageRemove: "readonly",
        sessionStorageGet: "readonly",
        sessionStorageSet: "readonly",
        sessionStorageRemove: "readonly",
        ajaxRequest: "readonly",
        fetchJSON: "readonly",
        submitForm: "readonly",
        trackEvent: "readonly",
        logError: "readonly", // TEUI.Logging.logError
        debugLog: "readonly", // TEUI.Logging.debug
        isMobile: "readonly",
        isTablet: "readonly",
        isDesktop: "readonly",
        getBreakpoint: "readonly",
        onResize: "readonly",
        onScroll: "readonly",
        scrollToElement: "readonly",
        smoothScroll: "readonly",
        copyToClipboard: "readonly",
        printPage: "readonly",
        setPageTitle: "readonly",
        getMetaTag: "readonly",
        setMetaTag: "readonly",
        addScript: "readonly",
        addStylesheet: "readonly",
        preloadImage: "readonly",
        onDOMReady: "readonly",
        triggerEvent: "readonly",
        delegateEvent: "readonly",
        undelegateEvent: "readonly",
        isInViewport: "readonly",
        lazyLoadImage: "readonly",
        infiniteScroll: "readonly",
        autocomplete: "readonly",
        sortableList: "readonly",
        draggableElement: "readonly",
        resizeObserver: "readonly", // Class, not function
        mutationObserver: "readonly", // Class
        intersectionObserver: "readonly", // Class
        performanceNow: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        setDynamicStyles: "readonly",
        getAppliedComputedStyles: "readonly",
        getDevicePixelRatio: "readonly",
        isOnline: "readonly",
        onOnline: "readonly",
        onOffline: "readonly",
        getGeolocation: "readonly",
        watchGeolocation: "readonly",
        clearGeolocationWatch: "readonly",
        vibrate: "readonly",
        requestFullscreen: "readonly",
        exitFullscreen: "readonly",
        isFullscreen: "readonly",
        getScreenOrientation: "readonly",
        lockScreenOrientation: "readonly",
        unlockScreenOrientation: "readonly",
        shareData: "readonly",
        copyTextToClipboard: "readonly",
        pasteFromClipboard: "readonly",
        getSystemTheme: "readonly",
        onThemeChange: "readonly",
        speakText: "readonly",
        recognizeSpeech: "readonly",
        sendNotification: "readonly",
        requestPermission: "readonly",
        checkPermission: "readonly",
        openDB: "readonly",
        addToDB: "readonly",
        getFromDB: "readonly",
        updateInDB: "readonly",
        deleteFromDB: "readonly",
        clearDB: "readonly",
        getWorker: "readonly", // function
        sendMessageToWorker: "readonly",
        onMessageFromWorker: "readonly",
        terminateWorker: "readonly",
        updateReferencePercentageIndicator: "readonly",
        calculateTBPEffects: "readonly",
        getField: "readonly",
        calculateL34: "readonly",
        updateAllReferenceIndicators: "readonly",
      },
    },
    rules: {
      "no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "after-used",
          caughtErrors: "all",
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Potentially add/adjust other rules here
      // e.g. "no-undef": "warn" to make undefined variables warnings instead of errors temporarily
    },
  },

  // ESLint plugin for Prettier integration
  // This should usually be the last configuration in the array
  eslintPluginPrettierRecommended,
];
