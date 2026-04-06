import { checkConstraints } from './src/utils/constraintUtils.js';

console.log("==========================================");
console.log("🚀 CONSTRAINT MODULE TESTING SUITE 🚀");
console.log("==========================================\n");

let passed = 0;
let total = 0;

function runTest(testName, staff, day, period, constraint, expectedResult) {
    total++;
    const result = checkConstraints(staff, day, period, constraint);
    const success = result === expectedResult;
    
    if (success) {
        passed++;
        console.log(`✅ [PASS] ${testName}`);
    } else {
        console.log(`❌ [FAIL] ${testName}`);
        console.log(`   Expected: ${expectedResult}`);
        console.log(`   Got: ${result}`);
    }
}

// -----------------------------------------------------
// TEST MOKCS
// -----------------------------------------------------

const dummyStaff = { hours: 10 }; // A staff member who has already taught 10 hours

const strictConstraint = {
    avoidDays: ['Monday'],
    avoidPeriods: [1],
    avoidSlots: [{ day: 'Wednesday', period: 3 }],
    maxHours: 12
};

// -----------------------------------------------------
// RUN TESTS
// -----------------------------------------------------

runTest("1. Should PASS if day, period, and slot are completely free", 
    dummyStaff, 'Tuesday', 2, strictConstraint, true
);

runTest("2. Should FAIL (Block assignment) if trying to schedule on an 'Avoid Day' (Monday)", 
    dummyStaff, 'Monday', 2, strictConstraint, false
);

runTest("3. Should FAIL (Block assignment) if trying to schedule on an 'Avoid Period' (Period 1)", 
    dummyStaff, 'Tuesday', 1, strictConstraint, false
);

runTest("4. Should FAIL (Block assignment) if trying to schedule on an 'Avoid Specific Slot' (Wednesday P3)", 
    dummyStaff, 'Wednesday', 3, strictConstraint, false
);

runTest("5. Should PASS for a slot right next to an avoided one (Wednesday P4)", 
    dummyStaff, 'Wednesday', 4, strictConstraint, true
);

// Testing Max Hours
const overworkedStaff = { hours: 12 };
runTest("6. Should FAIL (Block assignment) if staff has reached their Max Hours", 
    overworkedStaff, 'Tuesday', 4, strictConstraint, false
);

const overworkedDefaultStaff = { hours: 17 };
runTest("7. Should FAIL using the default max hours (17) if none is specified", 
    overworkedDefaultStaff, 'Tuesday', 4, {}, false
);

console.log("\n==========================================");
console.log(`📋 Test Results: ${passed} / ${total} Passed`);
console.log("==========================================");
