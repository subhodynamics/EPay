async getTransactions() {
    return this.orderModel.aggregate([
      { $lookup: { from: 'orderstatuses', localField: '_id', foreignField: 'collect_id', as: 'status' } },
      { $unwind: '$status' },
    ]);
  }