const ManufacturingOrder = require('../models/ManufacturingOrder');
const WorkOrder = require('../models/WorkOrder');
const WorkCenter = require('../models/WorkCenter');

class ManufacturingService {
  // Auto-generate work orders for manufacturing order
  static async generateWorkOrders(manufacturingOrderId, workCenterIds) {
    try {
      const manufacturingOrder = await ManufacturingOrder.findById(manufacturingOrderId);
      if (!manufacturingOrder) throw new Error('Manufacturing order not found');

      const workOrders = [];
      
      for (let i = 0; i < workCenterIds.length; i++) {
        const workOrder = new WorkOrder({
          name: `${manufacturingOrder.product} - Step ${i + 1}`,
          manufacturingOrder: manufacturingOrderId,
          workCenter: workCenterIds[i],
          sequence: i + 1
        });
        
        await workOrder.save();
        workOrders.push(workOrder._id);
      }

      // Update manufacturing order with work orders
      manufacturingOrder.workOrders = workOrders;
      await manufacturingOrder.save();

      return workOrders;
    } catch (error) {
      throw error;
    }
  }

  // Calculate manufacturing order progress
  static async updateManufacturingOrderProgress(manufacturingOrderId) {
    try {
      const workOrders = await WorkOrder.find({ manufacturingOrder: manufacturingOrderId });
      const completedOrders = workOrders.filter(wo => wo.status === 'completed').length;
      const progress = workOrders.length > 0 ? Math.round((completedOrders / workOrders.length) * 100) : 0;

      await ManufacturingOrder.findByIdAndUpdate(manufacturingOrderId, { progress });

      // Update status if all work orders completed
      if (progress === 100) {
        await ManufacturingOrder.findByIdAndUpdate(manufacturingOrderId, { 
          status: 'done',
          endDate: new Date()
        });
      } else if (progress > 0) {
        await ManufacturingOrder.findByIdAndUpdate(manufacturingOrderId, { 
          status: 'in_progress',
          startDate: new Date()
        });
      }

      return progress;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ManufacturingService;