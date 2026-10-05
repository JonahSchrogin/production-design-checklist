/**
 * AutoHR Application Logic
 * Interactive ROI Calculator, Workflow Simulator, FAQ Accordion, and Demo Booking
 */

document.addEventListener('DOMContentLoaded', () => {
    initWorkflowSimulator();
    initRoiCalculator();
    initFaqAccordion();
    initDemoForm();
    initMobileNav();
});

// ==========================================
// 1. Interactive Workflow Simulator
// ==========================================
const workflowScenarios = {
    onboarding: [
        { step: 1, title: "Offer Acceptance Trigger", desc: "Candidate signs digital offer letter in DocuSign.", time: "0.0s" },
        { step: 2, title: "Identity & Account Provisioning", desc: "Auto-creates Okta, Google Workspace, Slack, and HRIS profiles.", time: "+1.2s" },
        { step: 3, title: "Asset Order & Shipping", desc: "Triggers IT hardware dispatch with pre-configured MDM profiles.", time: "+3.5s" },
        { step: 4, title: "Day 1 Orientation & Buddy Match", desc: "Invites sent to calendar, welcome deck dispatched, mentor assigned.", time: "+4.1s" }
    ],
    leave: [
        { step: 1, title: "Employee Requests Time Off", desc: "Submitted directly via Slack / Teams bot with natural language.", time: "0.0s" },
        { step: 2, title: "Automated Policy & Blackout Check", desc: "Validates accruals, team coverage, and holiday overlap instantly.", time: "+0.4s" },
        { step: 3, title: "Manager Instant Approval", desc: "One-tap approval button routed directly in chat channel.", time: "+1.0s" },
        { step: 4, title: "Calendar & Payroll Balance Sync", desc: "PTO balance deducted and team calendar status updated automatically.", time: "+1.5s" }
    ],
    performance: [
        { step: 1, title: "Review Cycle Auto-Launch", desc: "Kicks off quarterly review schedule based on tenure milestones.", time: "0.0s" },
        { step: 2, title: "360 Peer & Self Feedback Forms", desc: "Dispatches smart evaluation forms with AI-assisted prompt tips.", time: "+0.8s" },
        { step: 3, title: "Automated Reminder Escalation", desc: "Nudges pending reviewers at optimal times without HR manual chase.", time: "+2.0s" },
        { step: 4, title: "Compensation Matrix Calibration", desc: "Synthesizes score cards and auto-populates merit increase proposals.", time: "+3.2s" }
    ],
    offboarding: [
        { step: 1, title: "Departure Notification", desc: "HR registers confirmed departure date or termination event.", time: "0.0s" },
        { step: 2, title: "Immediate Access Revocation", desc: "Zero-trust session termination across all SaaS apps & VPN access.", time: "+0.5s" },
        { step: 3, title: "Hardware Return Logistics", desc: "Pre-paid shipping label and return box dispatched to employee.", time: "+1.2s" },
        { step: 4, title: "Final Pay & COBRA Compliance", desc: "Final paycheck calculation, accrued PTO payout, and COBRA packet sent.", time: "+2.1s" }
    ]
};

function initWorkflowSimulator() {
    const displayContainer = document.getElementById('simulatorDisplay');
    const buttons = document.querySelectorAll('.scenario-btn');

    function renderScenario(scenarioKey) {
        const steps = workflowScenarios[scenarioKey] || workflowScenarios.onboarding;
        displayContainer.innerHTML = `
            <div class="flow-step-container">
                ${steps.map(s => `
                    <div class="flow-step">
                        <div class="step-num">${s.step}</div>
                        <div class="step-body">
                            <h4>${escapeHtml(s.title)}</h4>
                            <p>${escapeHtml(s.desc)}</p>
                        </div>
                        <div class="step-meta">${s.time}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const scenario = btn.getAttribute('data-scenario');
            renderScenario(scenario);
        });
    });

    renderScenario('onboarding');
}

// ==========================================
// 2. Interactive ROI & Time-Savings Calculator
// ==========================================
function initRoiCalculator() {
    const employeeCountInput = document.getElementById('employeeCount');
    const hrTeamSizeInput = document.getElementById('hrTeamSize');
    const hourlyRateInput = document.getElementById('hourlyRate');
    const hiringVelocityInput = document.getElementById('hiringVelocity');

    const employeeCountDisplay = document.getElementById('employeeCountDisplay');
    const hrTeamSizeDisplay = document.getElementById('hrTeamSizeDisplay');
    const hourlyRateDisplay = document.getElementById('hourlyRateDisplay');
    const hiringVelocityDisplay = document.getElementById('hiringVelocityDisplay');

    const annualSavingsDisplay = document.getElementById('annualSavings');
    const hoursSavedDisplay = document.getElementById('hoursSaved');
    const velocityBoostDisplay = document.getElementById('velocityBoost');
    const paybackPeriodDisplay = document.getElementById('paybackPeriod');

    function calculate() {
        const employees = parseInt(employeeCountInput.value, 10);
        const hrSize = parseInt(hrTeamSizeInput.value, 10);
        const hourlyRate = parseInt(hourlyRateInput.value, 10);
        const newHires = parseInt(hiringVelocityInput.value, 10);

        employeeCountDisplay.textContent = employees.toLocaleString();
        hrTeamSizeDisplay.textContent = hrSize;
        hourlyRateDisplay.textContent = `$${hourlyRate}`;
        hiringVelocityDisplay.textContent = newHires;

        // Formula:
        // Average HR admin time per employee per month saved: ~0.45 hrs
        // Plus onboarding time saved per hire: ~6.5 hrs
        const monthlyHoursSaved = Math.round((employees * 0.35) + (newHires * 6.5) + (hrSize * 8));
        const monthlyDollarSavings = monthlyHoursSaved * hourlyRate;
        const annualDollarSavings = monthlyDollarSavings * 12;

        // Estimated velocity boost index
        const velocityBoost = (3.0 + (newHires / 15)).toFixed(1);

        // Payback period in months
        const estimatedMonthlySoftwareCost = Math.max(350, employees * 2.5);
        const paybackMonths = Math.max(0.8, (estimatedMonthlySoftwareCost * 2) / (monthlyDollarSavings || 1)).toFixed(1);

        annualSavingsDisplay.textContent = `$${annualDollarSavings.toLocaleString()}`;
        hoursSavedDisplay.textContent = `${monthlyHoursSaved.toLocaleString()} hrs`;
        velocityBoostDisplay.textContent = `${velocityBoost}x`;
        paybackPeriodDisplay.textContent = `${paybackMonths} Months`;
    }

    [employeeCountInput, hrTeamSizeInput, hourlyRateInput, hiringVelocityInput].forEach(el => {
        if (el) {
            el.addEventListener('input', calculate);
        }
    });

    calculate();
}

// ==========================================
// 3. FAQ Accordion
// ==========================================
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(other => other.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// ==========================================
// 4. Contact & Demo Request Form
// ==========================================
function initDemoForm() {
    const form = document.getElementById('demoForm');
    const statusDiv = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('fullName').value.trim();
        const email = document.getElementById('workEmail').value.trim();
        const company = document.getElementById('companyName').value.trim();

        if (!name || !email || !company) {
            statusDiv.textContent = 'Please fill out all required fields.';
            statusDiv.className = 'form-status';
            statusDiv.style.display = 'block';
            statusDiv.style.background = '#fee2e2';
            statusDiv.style.color = '#991b1b';
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Scheduling Consultation...';

        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Request Tailored Demo';
            form.reset();

            statusDiv.className = 'form-status success';
            statusDiv.textContent = `Thank you, ${name}! Your demo request for ${company} has been received. An HR Automation specialist will contact you at ${email} shortly.`;
        }, 800);
    });
}

// ==========================================
// 5. Mobile Navigation
// ==========================================
function initMobileNav() {
    const toggle = document.getElementById('mobileToggle');
    const nav = document.getElementById('mainNav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
        const isShown = nav.style.display === 'flex';
        nav.style.display = isShown ? 'none' : 'flex';
        if (!isShown) {
            nav.style.flexDirection = 'column';
            nav.style.position = 'absolute';
            nav.style.top = '70px';
            nav.style.left = '0';
            nav.style.width = '100%';
            nav.style.backgroundColor = '#ffffff';
            nav.style.padding = '1.5rem';
            nav.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
        }
    });
}

// Helper to sanitize text
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
