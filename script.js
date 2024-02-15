document.addEventListener('DOMContentLoaded', function() {
    const accountsContainer = document.getElementById('accountsContainer');
    const addAccountBtn = document.getElementById('addAccountBtn');
    const downloadInvoiceBtn = document.getElementById('downloadInvoiceBtn');
    const trxidInputContainer = document.getElementById('trxidInputContainer');
    const submitTrxidBtn = document.getElementById('submitTrxidBtn');
    const trxidInput = document.getElementById('trxidInput');

    const officialDiscounts = {
        smallAccount: 0, // 5% discount for small accounts
        bigAccount: 0 // 10% discount for big accounts
    };

    let accountCount = 0;
    // Define actual prices for addons
    const addonPrices = {
        'lifeTimePayout': 300, // Example price for 95% Life Time Payout
        'noMinimumDays': 200, // Example price for No Minimum Trading Days
        'refund': 500, // Example price for 150% Refund
        '125Refund': 400 // Example price for 125% Refund
    };

    // Segmented pricing configuration
    const pricingConfig = {
        'stellar': {
            'swap': {
                '1step': {'6K': 55, '15K': 111, '25K': 187, '50K': 280, '100K': 485, '200K': 935},
                '2step': {'6K': 51, '15K': 102, '25K': 170, '50K': 255, '100K': 442, '200K': 850}
            },
            'swapFree': {
                '1step': {'6K': 62, '15K': 122, '25K': 206, '50K': 309, '100K': 533, '200K': 1029},
                '2step': {'6K': 56, '15K': 112, '25K': 187, '50K': 281, '100K': 486, '200K': 935}
            }
        },
        'express': {
            'swap': {
                'consistency': {'6K': 43, '15K': 85, '25K': 170, '50K': 255, '100K': 468, '200K': 850},
                'nonConsistency': {'6K': 51, '15K': 102, '25K': 196, '50K': 232, '100K': 595}
            },
            'swapFree': {
                'consistency': {'6K': 47, '15K': 94, '25K': 187, '50K': 281, '100K': 513, '200K': 935},
                'nonConsistency': {'6K': 56, '15K': 112, '25K': 215, '50K': 355, '100K': 655}
            }
        },
        'evaluation': {
            'swap': {
                '6K': 43, '15K': 85, '25K': 170, '50K': 255, '100K': 467, '200K': 850
            },
            'swapFree': {
                '6K': 46, '15K': 94, '25K': 187, '50K': 281, '100K': 513, '200K': 934
            }
        }
    };

    function updateStepTypeOptions(stepTypeSelect, challengeType) {
        stepTypeSelect.innerHTML = '';

        // DaisyUI classes for select dropdowns
        let classAttr = 'select select-bordered w-full';

        if (challengeType === 'stellar') {
            stepTypeSelect.innerHTML = `<option value="1step" class="${classAttr}">1-Step</option><option value="2step" class="${classAttr}">2-Step</option>`;
        } else if (challengeType === 'express') {
            stepTypeSelect.innerHTML = `<option value="consistency" class="${classAttr}">Consistency</option><option value="nonConsistency" class="${classAttr}">Non-Consistency</option>`;
        } else {
            stepTypeSelect.innerHTML = `<option disabled selected class="${classAttr}">Select Step Type</option>`;
        }
    }

function calculatePriceForAccount(challengeType, swapType, stepType, sizeOfAccount, addons) {
    let basePrice = 0;
    // Determine the base price from the configuration
    if (challengeType === 'evaluation') {
        if (pricingConfig[challengeType] && pricingConfig[challengeType][swapType]) {
            basePrice = pricingConfig[challengeType][swapType][sizeOfAccount] || 0;
        }
    } else {
        if (pricingConfig[challengeType] && pricingConfig[challengeType][swapType] && pricingConfig[challengeType][swapType][stepType]) {
            basePrice = pricingConfig[challengeType][swapType][stepType][sizeOfAccount] || 0;
        }
    }

    // Initial total price starts as the base price
    let totalPrice = basePrice;

    // Calculate addon prices based on the original base price
    addons.forEach(addon => {
        if (addon.checked) {
            let addonIncrease = 0; // Percentage increase
            switch (challengeType) {
                case 'stellar':
                    if (stepType === '1step') {
                        addonIncrease = addon.value === 'lifeTimePayout' ? 0.10 :
                                        addon.value === 'noMinimumDays' ? 0.15 :
                                        addon.value === 'refund' || addon.value === '125Refund' ? 0.10 : 0;
                    } else if (stepType === '2step') {
                        addonIncrease = addon.value === 'lifeTimePayout' ? 0.20 :
                                        addon.value === 'noMinimumDays' ? 0.15 :
                                        addon.value === 'refund' || addon.value === '125Refund' ? 0.10 : 0;
                    }
                    break;
                case 'express':
                    addonIncrease = addon.value === 'lifeTimePayout' ? 0.30 : 0.10; // No "No Minimum Trading Days" for Express
                    break;
                case 'evaluation':
                    addonIncrease = addon.value === 'lifeTimePayout' ? 1.20 :
                                    addon.value === 'noMinimumDays' ? 0.15 :
                                    addon.value === 'refund' || addon.value === '125Refund' ? 0.10 : 0;
                    break;
            }
            // Increase total price by the addon's percentage of the original base price
            totalPrice += basePrice * addonIncrease;
        }
    });

    return totalPrice; // Return the total price after all addon increases
}


    function updateAccountSizeVisibility(accountDiv) {
        const challengeTypeSelect = accountDiv.querySelector('.challengeType');
        const stepTypeSelect = accountDiv.querySelector('.stepType');
        const sizeOfAccountSelect = accountDiv.querySelector('.sizeOfAccount');
        const option200K = sizeOfAccountSelect.querySelector('option[value="200K"]');
        const noMinimumDaysCheckbox = accountDiv.querySelector('input[name="noMinimumDays"]');
        const refund125Checkbox = accountDiv.querySelector('input[name="125Refund"]');
        const refund150Checkbox = accountDiv.querySelector('input[name="refund"]');

        if (challengeTypeSelect.value === 'express' && stepTypeSelect.value === 'nonConsistency') {
            option200K.style.display = 'none';
        } else {
            option200K.style.display = 'block'; // Use 'block' or '' depending on how the options are styled in your application
        }

        // Hide No Minimum Trading Days addon if Express is selected
        noMinimumDaysCheckbox.parentElement.style.display = challengeTypeSelect.value === 'express' ? 'none' : 'block';

        // Ensure only one of the refund addons can be selected
        refund125Checkbox.onchange = function() {
            if (refund125Checkbox.checked) refund150Checkbox.checked = false;
        };
        refund150Checkbox.onchange = function() {
            if (refund150Checkbox.checked) refund125Checkbox.checked = false;
        };
    }

    function updateSelectionSummary() {
    const selectionSummaries = document.getElementById('selectionSummaries');
    selectionSummaries.innerHTML = ''; // Clear previous summaries
    let totalPrice = 0;
    let totalDiscount = 0;

    document.querySelectorAll('.account').forEach((account, index) => {
        const sizeOfAccount = account.querySelector('.sizeOfAccount').value;
        const challengeType = account.querySelector('.challengeType').value;
        const swapType = account.querySelector('.swapType').value;
        const stepType = account.querySelector('.stepType').value;
        const addons = account.querySelectorAll('input[type="checkbox"]');
        
        const price = calculatePriceForAccount(challengeType, swapType, stepType, sizeOfAccount, addons);
        totalPrice += price;

        // Apply discount based on account size
        if (['6K', '15K', '25K'].includes(sizeOfAccount)) {
            totalDiscount += price * (officialDiscounts.smallAccount / 100);
        } else if (['50K', '100K', '200K'].includes(sizeOfAccount)) {
            totalDiscount += price * (officialDiscounts.bigAccount / 100);
        }

        const summary = document.createElement('div');
        summary.classList.add('selection-summary');
        summary.innerHTML = `Account ${index + 1}: ${challengeType} + ${swapType} + ${stepType} + ${sizeOfAccount}` +
                            (addons.length ? ' + ' + Array.from(addons).filter(addon => addon.checked).map(addon => addon.getAttribute('data-label')).join(' + ') : '') +
                            `<br>Price: $${price.toFixed(2)}`;
        selectionSummaries.appendChild(summary);
    });

    // Calculate the final total price after discount
    let finalTotalPrice = totalPrice - totalDiscount;

    // Update the HTML for Official Discount and Total Price After Discount
    const totalPriceElement = document.getElementById('totalPrice');
    totalPriceElement.innerHTML = `Official Discount: $${totalDiscount.toFixed(2)}<br>Total Price After Discount: $${finalTotalPrice.toFixed(2)}`;
}

    function addAccount() {
        accountCount++;
        const accountDiv = document.createElement('div');
        accountDiv.className = 'account bg-purple-500 shadow p-4 rounded-lg mb-4 space-y-4';
    
    accountDiv.innerHTML = `
    <div class="flex flex-wrap md:flex-nowrap">
    <div class="left-options space-y-4 flex-1">
        <div class="option-group">
            <label class="block text-white text-xl mb-2">Challenge Type:</label>
            <select class="challengeType w-full rounded-md bg-purple-700 border border-purple-600 text-white py-2 px-4">
                <option value="stellar">Stellar</option>
                <option value="evaluation">Evaluation</option>
                <option value="express">Express</option>
            </select>
        </div>
        <div class="option-group">
            <label class="block text-white text-xl mb-2">Swap Type:</label>
            <select class="swapType w-full rounded-md bg-purple-700 border border-purple-600 text-white py-2 px-4">
                <option value="swap">Swap</option>
                <option value="swapFree">Swap Free</option>
            </select>
        </div>
        <div class="option-group">
            <label class="block text-white text-xl mb-2">Step Type:</label>
            <select class="stepType w-full rounded-md bg-purple-700 border border-purple-600 text-white py-2 px-4"></select>
        </div>
        <div class="option-group">
            <label class="block text-white text-xl mb-2">Account Size:</label>
            <select class="sizeOfAccount w-full rounded-md bg-purple-700 border border-purple-600 text-white py-2 px-4">
                <option value="6K">6K</option>
                <option value="15K">15K</option>
                <option value="25K">25K</option>
                <option value="50K">50K</option>
                <option value="100K">100K</option>
                <option value="200K">200K</option>
            </select>
        </div>
    </div>
    <div class="right-options space-y-4 flex-1 mt-4 md:mt-0 md:ml-40">
        <div class="checkbox-group text-xl">
            <input type="checkbox" id="lifeTimePayout-1" name="lifeTimePayout" value="lifeTimePayout" class="rounded text-purple-500 focus:ring-blue-400">
            <label for="lifeTimePayout-1" class="text-white ml-2">95% Life Time Payout</label>
        </div>
        <div class="checkbox-group text-xl">
            <input type="checkbox" id="noMinimumDays-1" name="noMinimumDays" value="noMinimumDays" class="rounded text-blue-500 focus:ring-blue-400">
            <label for="noMinimumDays-1" class="text-white ml-2">No Minimum Trading Days</label>
        </div>
        <div class="checkbox-group text-xl">
            <input type="checkbox" id="125Refund-1" name="125Refund" value="125Refund" class="rounded text-blue-500 focus:ring-blue-400">
            <label for="125Refund-1" class="text-white ml-2">125% Refund</label>
        </div>
        <div class="checkbox-group text-xl">
            <input type="checkbox" id="refund-1" name="refund" value="refund" class="rounded text-blue-500 focus:ring-blue-400">
            <label for="refund-1" class="text-white ml-2">150% Refund</label>
        </div>
    </div>
</div>


`;


    const challengeTypeSelect = accountDiv.querySelector('.challengeType');
    const swapTypeSelect = accountDiv.querySelector('.swapType');
    const stepTypeSelect = accountDiv.querySelector('.stepType');
    const sizeOfAccountSelect = accountDiv.querySelector('.sizeOfAccount');

    challengeTypeSelect.addEventListener('change', function() {
        updateStepTypeOptions(stepTypeSelect, challengeTypeSelect.value);
        updateAccountSizeVisibility(accountDiv); // Update visibility based on current selections
        updateSelectionSummary(); // Update pricing and summary

        // Uncheck all addon checkboxes when challenge type changes
        const addonCheckboxes = accountDiv.querySelectorAll('input[type="checkbox"]');
        addonCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    });

    swapTypeSelect.addEventListener('change', function() {
        updateSelectionSummary(); // Update pricing and summary whenever Swap Type changes
    });

    stepTypeSelect.addEventListener('change', function() {
        updateSelectionSummary(); // Update pricing and summary whenever Step Type changes
    });

    sizeOfAccountSelect.addEventListener('change', function() {
        updateSelectionSummary(); // Update pricing and summary whenever Account Size changes
    });

    updateStepTypeOptions(stepTypeSelect, challengeTypeSelect.value);
    updateAccountSizeVisibility(accountDiv); // Ensure correct initial state for the "200K" option visibility and addons

    const addonInputs = accountDiv.querySelectorAll('input[type="checkbox"]');
    addonInputs.forEach(input => {
        input.addEventListener('change', updateSelectionSummary); // Update pricing and summary whenever addon selections change
    });

    if (accountCount > 1) {
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove This Account';
        // Apply DaisyUI styles for the remove button, with background and hover effects
        removeBtn.className = 'btn btn-primary w-full mt-4 rounded-full bg-yellow-500 hover:bg-red-300 text-black';
        removeBtn.onclick = function() {
            accountsContainer.removeChild(accountDiv);
            accountCount--;
            updateSelectionSummary();
        };
        accountDiv.appendChild(removeBtn);
    }

    accountsContainer.appendChild(accountDiv);
    updateSelectionSummary();
}
downloadInvoiceBtn.addEventListener('click', function() {
        trxidInputContainer.style.display = 'block';
    });

    function generatePDF(trxid) {
        const { jsPDF } = window.jspdf; // Ensure jsPDF is correctly loaded
        const doc = new jsPDF();
    
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(128, 0, 128); // Set title color
        doc.text("FundedNext Payment Partner", 105, 20, null, null, 'center'); // Center title
    
        // Draw title underline
        doc.setDrawColor(128, 0, 128); // Purple line color
        doc.setLineWidth(0.5);
        doc.line(20, 25, 190, 25); // Title underline
    
        let yPos = 35; // Start position for items listing
    
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text("ITEMS", 20, yPos);
        doc.text("PRICE", 160, yPos, { align: "right" });
    
        yPos += 10; // Space between column titles and first item
    
        // Loop through each account to add their details to the PDF
        document.querySelectorAll('.account').forEach((account, index) => {
            const challengeType = account.querySelector('.challengeType').value;
            const swapType = account.querySelector('.swapType').value;
            const stepType = account.querySelector('.stepType').value;
            const sizeOfAccount = account.querySelector('.sizeOfAccount').value;
            const addons = Array.from(account.querySelectorAll('input[type="checkbox"]:checked')).map(addon => addon.getAttribute('data-label')).join(', ');
    
            let itemDetails = `Account ${index + 1}: ${challengeType}, ${swapType}, ${stepType}, Size: ${sizeOfAccount}`;
            if (addons) itemDetails += `, Addons: ${addons}`;
    
            let price = calculatePriceForAccount(challengeType, swapType, stepType, sizeOfAccount, account.querySelectorAll('input[type="checkbox"]'));
    
            // Split long item details if necessary
            let splitItemDetails = doc.splitTextToSize(itemDetails, 85); // Adjust width to fit before the line
    
            // Check if adding the content will exceed the page height
            if (yPos + (splitItemDetails.length + 1) * 6 > 280) { // Adjust the value based on your page size
                doc.addPage(); // Add a new page
                yPos = 10; // Reset yPos for the new page
            }
    
            doc.text(splitItemDetails, 20, yPos);
            doc.text(`$${price.toFixed(2)}`, 160, yPos, { align: "right" });
    
            yPos += (splitItemDetails.length + 1) * 6; // Adjust Y position based on the number of lines
        });
    
        // Ensure dynamic adjustment of the separation line
        doc.setDrawColor(0); // Black color for separation line
        doc.line(135, 28, 135, yPos); // Adjust line to match items length
    
        // Space before displaying TRXID
        yPos += 10; 
        doc.text(`TRXID: ${trxid}`, 20, yPos);
    
        // Formatting for Official Discount and Total Price After Discount
        yPos += 10; // Additional space before showing the discount
        // Extract and format discount and total price information
        const totalPriceElement = document.getElementById('totalPrice').innerHTML;
        const [officialDiscountText, totalPriceAfterDiscountText] = totalPriceElement.split('<br>').map(text => text.trim());
    
        // Adjust font for discount and total price details
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(officialDiscountText, 20, yPos);
    
        yPos += 10; // Space between discount and total price text
        doc.text(totalPriceAfterDiscountText, 20, yPos);
    
        // Save the PDF document
        doc.save('FundedNext_Invoice.pdf');
    }

    submitTrxidBtn.addEventListener('click', function() {
    const trxid = trxidInput.value.trim();
    if (trxid) {
        generatePDF(trxid);
        // Assuming generatePDF is asynchronous and doesn't block the execution,
        // you might want to set a timeout or wait for a specific event indicating the PDF has been generated.
        // For simplicity, let's just reload the page immediately here.
        setTimeout(() => { window.location.reload(); }, 1000); // Adjust delay as needed
    } else {
        alert('Please complete the payment and submit your TRXID.');
    }
});




    addAccountBtn.addEventListener('click', addAccount);
    // Initialize the first account
    addAccount();
});