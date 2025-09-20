const WorkOrder = require('../models/WorkOrder');
const ManufacturingService = require('../services/ManufacturingService');

const handleSocketConnection = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join dashboard room for real-time updates
    socket.on('join_dashboard', () => {
      socket.join('dashboard');
      console.log(`User ${socket.id} joined dashboard room`);
    });

    // Handle work order status updates from operators
    socket.on('update_work_order', async (data) => {
      try {
        const { workOrderId, status, comment, userId } = data;
        
        const workOrder = await WorkOrder.findById(workOrderId)
          .populate('manufacturingOrder')
          .populate('workCenter')
          .populate('assignedOperator', 'name email');

        if (!workOrder) {
          socket.emit('error', { message: 'Work order not found' });
          return;
        }

        // Update work order status
        const updateData = { status };
        
        if (status === 'in_progress' && !workOrder.startTime) {
          updateData.startTime = new Date();
          updateData.assignedOperator = userId;
        } else if (status === 'completed') {
          updateData.endTime = new Date();
          if (workOrder.startTime) {
            updateData.duration = Math.round((new Date() - workOrder.startTime) / 60000);
          }
        }

        if (comment) {
          updateData.$push = {
            comments: {
              text: comment,
              user: userId,
              timestamp: new Date()
            }
          };
        }

        const updatedWorkOrder = await WorkOrder.findByIdAndUpdate(
          workOrderId,
          updateData,
          { new: true }
        ).populate('manufacturingOrder workCenter assignedOperator');

        // Update manufacturing order progress
        await ManufacturingService.updateManufacturingOrderProgress(
          workOrder.manufacturingOrder._id
        );

        // Broadcast to all dashboard users
        io.to('dashboard').emit('work_order_updated', updatedWorkOrder);
        
        // Send confirmation to operator
        socket.emit('work_order_update_success', updatedWorkOrder);

      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle operator scanning QR code
    socket.on('scan_qr_code', async (data) => {
      try {
        const { qrCode, userId } = data;
        
        // Find work center and active work order
        const workCenter = await WorkCenter.findOne({ qrCode });
        if (!workCenter) {
          socket.emit('qr_scan_error', { message: 'Invalid QR code' });
          return;
        }

        const workOrder = await WorkOrder.findOne({
          workCenter: workCenter._id,
          status: { $in: ['planned', 'in_progress', 'paused'] }
        })
        .populate('manufacturingOrder')
        .populate('workCenter')
        .populate('assignedOperator', 'name email');

        if (!workOrder) {
          socket.emit('qr_scan_error', { message: 'No active work order for this work center' });
          return;
        }

        socket.emit('qr_scan_success', workOrder);

      } catch (error) {
        socket.emit('qr_scan_error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = handleSocketConnection;