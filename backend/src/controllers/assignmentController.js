import Assignment from '../models/Assignment.js';
import PDFDocument from 'pdfkit';

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private/Admin/Manager
export const createAssignment = async (req, res) => {
  try {
    const { academicYear, semester, department, assignments } = req.body;
    
    const assignment = new Assignment({
      academicYear,
      semester,
      department,
      assignments,
      status: 'pending',
    });

    const createdAssignment = await assignment.save();
    res.status(201).json(createdAssignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
export const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({}).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (assignment) {
      res.json(assignment);
    } else {
      res.status(404).json({ message: 'Assignment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin approve/reject assignment
// @route   PUT /api/assignments/admin-approve/:id
// @access  Private/Admin
export const adminApprove = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    
    if (!['adminApproved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status for admin approval' });
    }

    const assignment = await Assignment.findById(req.params.id);
    
    if (assignment) {
      assignment.status = status;
      if (remarks) assignment.adminRemarks = remarks;
      
      const updatedAssignment = await assignment.save();
      res.json(updatedAssignment);
    } else {
      res.status(404).json({ message: 'Assignment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manager approve/reject assignment
// @route   PUT /api/assignments/manager-approve/:id
// @access  Private/Manager
export const managerApprove = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    
    if (!['managerApproved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status for manager approval' });
    }

    const assignment = await Assignment.findById(req.params.id);
    
    if (assignment) {
      if (assignment.status !== 'adminApproved') {
        return res.status(400).json({ message: 'Cannot approve until admin has approved' });
      }

      assignment.status = status;
      if (remarks) assignment.managerRemarks = remarks;
      
      const updatedAssignment = await assignment.save();
      res.json(updatedAssignment);
    } else {
      res.status(404).json({ message: 'Assignment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate PDF for assignment
// @route   GET /api/assignments/:id/pdf
// @access  Private
export const generateAssignmentPDF = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=assignment-${assignment.academicYear}-${assignment.semester}.pdf`
    );
    
    doc.pipe(res);
    
    // Header
    doc.fontSize(20).text('Subject Allocated Approval', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Academic Year: ${assignment.academicYear}`);
    doc.text(`Semester: ${assignment.semester}`);
    doc.text(`Department: ${assignment.department}`);
    doc.text(`Status: ${assignment.status.toUpperCase()}`);
    doc.moveDown();
    
    // Table Header
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Subject', 50, doc.y, { continued: true, width: 250 });
    doc.text('Faculty', 300, doc.y);
    doc.moveDown(0.5);
    
    // Table line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    
    doc.font('Helvetica');
    // Table Rows
    assignment.assignments.forEach(item => {
      const currentY = doc.y;
      doc.text(item.subjectName, 50, currentY, { width: 240 });
      doc.text(item.facultyName, 300, currentY, { width: 250 });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
    });
    
    doc.moveDown();
    
    // Remarks
    if (assignment.adminRemarks) {
      doc.font('Helvetica-Bold').text('Admin Remarks:');
      doc.font('Helvetica').text(assignment.adminRemarks);
      doc.moveDown();
    }
    
    if (assignment.managerRemarks) {
      doc.font('Helvetica-Bold').text('Manager Remarks:');
      doc.font('Helvetica').text(assignment.managerRemarks);
      doc.moveDown();
    }
    
    doc.end();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Reject assignment
// @route   PUT /api/assignments/reject/:id
// @access  Private/Admin/Manager
export const rejectAssignment = async (req, res) => {
  try {
    const { remarks } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    
    if (assignment) {
      assignment.status = 'rejected';
      if (req.user.role === 'admin' && remarks) {
        assignment.adminRemarks = remarks;
      } else if (req.user.role === 'manager' && remarks) {
        assignment.managerRemarks = remarks;
      }
      
      const updatedAssignment = await assignment.save();
      res.json(updatedAssignment);
    } else {
      res.status(404).json({ message: 'Assignment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete entire assignment record
// @route   DELETE /api/assignments/:id
// @access  Private/Admin
export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Block deletion of manager-approved records
    if (assignment.status === 'managerApproved') {
      return res.status(400).json({
        message: 'Cannot delete a fully approved assignment. It has been approved by both Admin and Manager.',
      });
    }

    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
