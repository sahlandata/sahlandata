document.addEventListener("DOMContentLoaded", () => {
  // Initialize variables
  let currentStep = 1
  let selectedNetwork = "AIRTEL"
  let selectedType = "SME"
  let selectedPlan = null
  let pinValue = ""
  let walletBalance = 0
  let transactionStatus = "success"
  let statusMessage = "Transaction successful"
  let transactionData = {}

  // DOM Elements
  const steps = ["step1", "step2", "step3", "step4", "step5"]
  const walletAmountEl = document.getElementById("walletAmount")
  const mobileNumberEl = document.getElementById("mobileNumber")
  const planListEl = document.getElementById("planList")
  const pinErrorEl = document.getElementById("pinError")
  const errorMessageEl = document.getElementById("errorMessage")

  // Initialize the dashboard
  initDashboard()

  function initDashboard() {
    // Set up network selection
    document.querySelectorAll(".network-logo").forEach((logo) => {
      logo.addEventListener("click", function () {
        document.querySelectorAll(".network-logo").forEach((l) => l.classList.remove("active"))
        this.classList.add("active")
        selectedNetwork = this.getAttribute("data-network")
        selectedPlan = null // Reset selected plan when network changes
        loadPlans()
      })
    })

    // Set up type selection
    document.querySelectorAll(".type-button").forEach((button) => {
      button.addEventListener("click", function () {
        document.querySelectorAll(".type-button").forEach((b) => b.classList.remove("active"))
        this.classList.add("active")
        selectedType = this.getAttribute("data-type")
        selectedPlan = null // Reset selected plan when type changes
        loadPlans()
      })
    })

    // Validate phone number input
    mobileNumberEl.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "").substring(0, 11)
    })

    // Load initial data
    fetchWalletBalance()
    loadPlans()
  }

  // Format currency
  function formatCurrency(amount) {
    return `₦${Number.parseFloat(amount)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
  }

  // Update wallet display
  function updateWalletDisplay() {
    walletAmountEl.textContent = formatCurrency(walletBalance)
  }

  // Show error message
  function showError(message, duration = 5000) {
    errorMessageEl.textContent = message
    errorMessageEl.style.display = "block"
    setTimeout(() => (errorMessageEl.style.display = "none"), duration)
  }

  // Navigation between steps
  function goToStep(stepNumber) {
    // Validate before proceeding to step 2
    if (stepNumber === 2) {
      if (!selectedPlan) {
        showError("Please select a data plan to continue")
        return
      }
      if (!validatePhoneNumber()) {
        return
      }
    }

    // Validate before proceeding to step 3
    if (stepNumber === 3) {
      if (!selectedPlan || !mobileNumberEl.value) {
        showError("Please complete all required information")
        return
      }
    }

    // Hide all steps
    steps.forEach((stepId) => {
      const el = document.getElementById(stepId)
      if (el) el.classList.remove("active")
    })

    // Show target step
    const target = document.getElementById(steps[stepNumber - 1])
    if (target) {
      target.classList.add("active")
      currentStep = stepNumber

      // Update confirmation step
      if (stepNumber === 2 && selectedPlan) {
        updateConfirmationDetails()
      }

      // Update transaction result step
      if (stepNumber === 4 && selectedPlan) {
        updateTransactionResult()
      }

      // Update receipt step
      if (stepNumber === 5 && selectedPlan) {
        updateReceipt()
      }
    }
  }

  // Update confirmation details
  function updateConfirmationDetails() {
    document.getElementById("confirmNetwork").textContent = selectedNetwork
    document.getElementById("confirmPlanName").textContent = selectedPlan.size
    document.getElementById("confirmPlanType").textContent = selectedType
    document.getElementById("confirmValidate").textContent = selectedPlan.validate
    document.getElementById("confirmMobileNumber").textContent = mobileNumberEl.value
    document.getElementById("confirmAmount").textContent = formatCurrency(selectedPlan.price)
  }

  // Validate phone number
  function validatePhoneNumber() {
    const phoneNumber = mobileNumberEl.value.trim()
    if (!phoneNumber) {
      showError("Please enter a phone number")
      return false
    }

    if (phoneNumber.length !== 11) {
      showError("Phone number must be 11 digits")
      return false
    }

    const networkPrefixes = {
      MTN: ["0803", "0806", "0703", "0706", "0813", "0816", "0810", "0814", "0903", "0906"],
      GLO: ["0805", "0807", "0705", "0815", "0811", "0905"],
      AIRTEL: ["0802", "0808", "0708", "0812", "0902", "0907", "0901"],
      "9MOBILE": ["0809", "0818", "0817", "0909", "0908"],
    }

    const prefix = phoneNumber.substring(0, 4)
    const validPrefixes = networkPrefixes[selectedNetwork] || []

    if (!validPrefixes.includes(prefix)) {
      showError(`Phone number does not match ${selectedNetwork} network`)
      return false
    }

    return true
  }

  // Load plans from server
  function loadPlans() {
    planListEl.innerHTML = '<div class="loading-indicator">Loading data plans...</div>'

    fetch(`get_plans.php?network=${selectedNetwork}&type=${selectedType}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok")
        }
        return res.json()
      })
      .then((data) => {
        if (data.status === "success") {
          displayPlans(data.plans)
        } else {
          showPlanError(data.message || "No plans available")
        }
      })
      .catch((err) => {
        console.error("Error loading plans:", err)
        showPlanError("Error loading plans. Please try again.")
      })
  }

  // Display plans in the UI
  function displayPlans(plans) {
    planListEl.innerHTML = ""

    if (!plans || plans.length === 0) {
      showPlanError("No plans found for selected network and type")
      return
    }

    plans.forEach((plan) => {
      if (!plan.id || !plan.size || !plan.validate || !plan.price) {
        console.error("Invalid plan data:", plan)
        return
      }

      const item = document.createElement("div")
      item.classList.add("plan-item")
      item.innerHTML = `
                <span class="plan-name">${plan.size} - ${plan.validate}</span>
                <span class="plan-price">${formatCurrency(plan.price)}</span>
            `
      item.addEventListener("click", () => selectPlan(plan, item))
      planListEl.appendChild(item)
    })
  }

  // Show plan loading error
  function showPlanError(message) {
    planListEl.innerHTML = `<div class="no-plans-message">${message}</div>`
  }

  // Handle plan selection
  function selectPlan(plan, element) {
    if (!plan || !plan.id || !plan.size || !plan.validate || !plan.price) {
      showError("Invalid plan data. Please try again.")
      return
    }

    selectedPlan = plan
    document.querySelectorAll(".plan-item").forEach((el) => el.classList.remove("selected"))
    element.classList.add("selected")

    // Automatically go to confirmation step after selection
    setTimeout(() => {
      goToStep(2)
    }, 300)
  }

  // Fetch wallet balance
  function fetchWalletBalance() {
    fetch("get_wallet_balance.php")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok")
        }
        return res.json()
      })
      .then((data) => {
        if (data.status === "success") {
          walletBalance = data.balance
          updateWalletDisplay()
        }
      })
      .catch((err) => {
        console.error("Error fetching wallet balance:", err)
      })
  }

  // PIN handling functions
  function appendPin(digit) {
    if (pinValue.length < 4) {
      pinValue += digit
      updatePinDisplay()

      if (pinValue.length === 4) {
        showProcessingOverlay()
        processPayment()
      }
    }
  }

  function deletePin() {
    pinValue = pinValue.slice(0, -1)
    updatePinDisplay()
    pinErrorEl.textContent = ""
  }

  function clearPin() {
    pinValue = ""
    updatePinDisplay()
    pinErrorEl.textContent = ""
  }

  function updatePinDisplay() {
    const pinBoxes = document.querySelectorAll(".pin-box")
    pinBoxes.forEach((box, index) => {
      box.textContent = pinValue[index] ? "*" : ""
    })
  }

  // Show processing overlay
  function showProcessingOverlay() {
    const overlay = document.createElement("div")
    overlay.className = "processing-overlay"
    overlay.innerHTML = `
            <div class="spinner"></div>
            <div>Processing payment...</div>
        `
    document.querySelector(".card").appendChild(overlay)
  }

  // Process payment with API
  function processPayment() {
    if (!selectedPlan || !mobileNumberEl.value || pinValue.length !== 4) {
      document.querySelector(".processing-overlay")?.remove()
      showError("Please complete all required information")
      return
    }

    const paymentData = {
      network: selectedNetwork,
      phone: mobileNumberEl.value,
      type: selectedType,
      plan_id: selectedPlan.id,
      pin: pinValue,
      amount: selectedPlan.price,
    }

    fetch("buy_data_process.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(paymentData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        document.querySelector(".processing-overlay")?.remove()

        if (data.status === "success") {
          transactionStatus = "success"
          statusMessage = data.message || "Transaction successful"
          transactionData = data.transaction || {}
          walletBalance = data.new_balance || walletBalance
          updateWalletDisplay()
        } else {
          transactionStatus = "failure"
          statusMessage = data.message || "Transaction failed. Please try again."

          if (data.message && data.message.toLowerCase().includes("insufficient")) {
            transactionStatus = "insufficient"
          } else if (data.message && data.message.toLowerCase().includes("pin")) {
            transactionStatus = "incorrect_pin"
          } else if (data.message && data.message.toLowerCase().includes("required")) {
            statusMessage = "Please complete all required fields"
          }
        }

        goToStep(4)
        pinValue = ""
        updatePinDisplay()
      })
      .catch((error) => {
        console.error("Payment processing error:", error)
        document.querySelector(".processing-overlay")?.remove()

        transactionStatus = "failure"
        statusMessage = "Network error. Please try again."

        goToStep(4)
        pinValue = ""
        updatePinDisplay()
      })
  }

  // Update transaction result display
  function updateTransactionResult() {
    const transactionId =
      transactionData.transaction_id || "DATA_" + Math.random().toString(36).substring(2, 10).toUpperCase()
    const now = new Date()
    const transactionTime =
      transactionData.transaction_time ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`

    // Calculate expiry date
    const validityDays = Number.parseInt(selectedPlan.validate) || 1
    const expiryDate = new Date(now)
    expiryDate.setDate(now.getDate() + validityDays)
    const expiryTime = `${expiryDate.getFullYear()}-${String(expiryDate.getMonth() + 1).padStart(2, "0")}-${String(expiryDate.getDate()).padStart(2, "0")} ${String(expiryDate.getHours()).padStart(2, "0")}:${String(expiryDate.getMinutes()).padStart(2, "0")}:${String(expiryDate.getSeconds()).padStart(2, "0")}`

    // Update status display
    const statusIcon = document.getElementById("statusIcon")
    const statusText = document.getElementById("statusText")
    const statusDetail = document.getElementById("statusDetail")
    const customerMessage = document.getElementById("customerMessage")

    if (transactionStatus === "success") {
      statusIcon.className = "fas fa-check-circle success-icon-large"
      statusIcon.style.color = "#28a745"
      statusText.textContent = "TRANSACTION SUCCESSFUL"
      statusText.className = "status-text success"
      statusDetail.textContent = statusMessage
      statusDetail.className = "status-detail status-success"
      customerMessage.style.display = "block"
      customerMessage.innerHTML = `
                Dear Customer, your purchase of <strong>${selectedPlan.size} ${selectedPlan.validate} Data plan</strong> for phone number <strong>${mobileNumberEl.value}</strong> was successful. Reference: <strong>${transactionData.reference || "N/A"}</strong>. Expiry Date: <strong>${expiryTime}</strong>
            `
    } else if (transactionStatus === "insufficient") {
      statusIcon.className = "fas fa-exclamation-circle success-icon-large"
      statusIcon.style.color = "#ffc107"
      statusText.textContent = "INSUFFICIENT BALANCE"
      statusText.className = "status-text warning"
      statusDetail.textContent = statusMessage
      statusDetail.className = "status-detail status-warning"
      customerMessage.style.display = "none"
    } else if (transactionStatus === "incorrect_pin") {
      statusIcon.className = "fas fa-times-circle success-icon-large"
      statusIcon.style.color = "#dc3545"
      statusText.textContent = "INCORRECT PIN"
      statusText.className = "status-text danger"
      statusDetail.textContent = statusMessage
      statusDetail.className = "status-detail status-danger"
      customerMessage.style.display = "none"
    } else {
      statusIcon.className = "fas fa-times-circle success-icon-large"
      statusIcon.style.color = "#dc3545"
      statusText.textContent = "TRANSACTION FAILED"
      statusText.className = "status-text danger"
      statusDetail.textContent = statusMessage
      statusDetail.className = "status-detail status-danger"
      customerMessage.style.display = "none"
    }

    // Update transaction details
    document.getElementById("transactionAmount").textContent = formatCurrency(selectedPlan.price)
    document.getElementById("displayTransactionId").textContent = transactionId
    document.getElementById("displayTransactionType").textContent = "DATA"
    document.getElementById("displayNetwork").textContent = selectedNetwork
    document.getElementById("displayPlanType").textContent = selectedType
    document.getElementById("displayPlanSize").textContent = selectedPlan.size
    document.getElementById("displayMobileNumber").textContent = mobileNumberEl.value
    document.getElementById("displayTransactionTime").textContent = transactionTime
  }

  // Update receipt display
  function updateReceipt() {
    const receiptStatusIcon = document.getElementById("receiptStatusIcon")
    const receiptStatusText = document.getElementById("receiptStatusText")
    const receiptStatus = document.getElementById("receiptStatus")
    const receiptStatusDetail = document.getElementById("receiptStatusDetail")

    if (transactionStatus === "success") {
      receiptStatusIcon.className = "fas fa-check-circle success-icon-large"
      receiptStatusIcon.style.color = "#28a745"
      receiptStatusText.textContent = "SUCCESSFUL"
      receiptStatusText.className = "status-text success"
      receiptStatus.textContent = "SUCCESSFUL"
      receiptStatus.style.color = "#28a745"
      receiptStatusDetail.textContent = statusMessage
      receiptStatusDetail.className = "status-detail status-success"
    } else if (transactionStatus === "insufficient") {
      receiptStatusIcon.className = "fas fa-exclamation-circle success-icon-large"
      receiptStatusIcon.style.color = "#ffc107"
      receiptStatusText.textContent = "INSUFFICIENT BALANCE"
      receiptStatusText.className = "status-text warning"
      receiptStatus.textContent = "INSUFFICIENT BALANCE"
      receiptStatus.style.color = "#ffc107"
      receiptStatusDetail.textContent = statusMessage
      receiptStatusDetail.className = "status-detail status-warning"
    } else if (transactionStatus === "incorrect_pin") {
      receiptStatusIcon.className = "fas fa-times-circle success-icon-large"
      receiptStatusIcon.style.color = "#dc3545"
      receiptStatusText.textContent = "INCORRECT PIN"
      receiptStatusText.className = "status-text danger"
      receiptStatus.textContent = "INCORRECT PIN"
      receiptStatus.style.color = "#dc3545"
      receiptStatusDetail.textContent = statusMessage
      receiptStatusDetail.className = "status-detail status-danger"
    } else {
      receiptStatusIcon.className = "fas fa-times-circle success-icon-large"
      receiptStatusIcon.style.color = "#dc3545"
      receiptStatusText.textContent = "TRANSACTION FAILED"
      receiptStatusText.className = "status-text danger"
      receiptStatus.textContent = "FAILED"
      receiptStatus.style.color = "#dc3545"
      receiptStatusDetail.textContent = statusMessage
      receiptStatusDetail.className = "status-detail status-danger"
    }

    // Update receipt details
    document.getElementById("receiptAmount").textContent = formatCurrency(selectedPlan.price)
    document.getElementById("receiptTransactionType").textContent = "Data Purchase"
    document.getElementById("receiptTransactionId").textContent =
      document.getElementById("displayTransactionId").textContent
    document.getElementById("receiptNetwork").textContent = selectedNetwork
    document.getElementById("receiptPlanType").textContent = selectedType
    document.getElementById("receiptPlanSize").textContent = selectedPlan.size
    document.getElementById("receiptMobileNumber").textContent = mobileNumberEl.value
    document.getElementById("receiptTime").textContent = document.getElementById("displayTransactionTime").textContent
  }

  // Top up again function
  window.topUpAgain = () => {
    selectedPlan = null
    mobileNumberEl.value = ""
    clearPin()
    goToStep(1)
  }

  // Expose functions to global scope for HTML onclick handlers
  window.goToStep = goToStep
  window.appendPin = appendPin
  window.deletePin = deletePin
  window.clearPin = clearPin
})
