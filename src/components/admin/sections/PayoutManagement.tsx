import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminCashoutRequests, useUpdateCashoutStatus, CashoutRequestWithUser } from "@/hooks/usePayoutManagement";
import { useAdminPaymentOrders, useConfirmPaymentOrder, useRejectPaymentOrder, PaymentOrderWithUser } from "@/hooks/useAdminPaymentOrders";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { CheckCircle, XCircle, Eye, DollarSign, User, Wallet, CreditCard, ArrowUpCircle } from "lucide-react";

export const PayoutManagement = () => {
  const { user } = useUnifiedAuth();
  const { data: cashoutRequests, isLoading: cashoutLoading } = useAdminCashoutRequests();
  const { data: paymentOrders, isLoading: paymentLoading } = useAdminPaymentOrders();
  const updateStatusMutation = useUpdateCashoutStatus();
  const confirmPaymentMutation = useConfirmPaymentOrder();
  const rejectPaymentMutation = useRejectPaymentOrder();
  
  const [selectedRequest, setSelectedRequest] = useState<CashoutRequestWithUser | null>(null);
  const [selectedPaymentOrder, setSelectedPaymentOrder] = useState<PaymentOrderWithUser | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const handleStatusUpdate = (requestId: string, status: 'approved' | 'completed' | 'rejected') => {
    if (!user?.id) return;

    updateStatusMutation.mutate({
      requestId,
      status,
      adminNotes: adminNotes || undefined,
      transactionId: status === 'completed' ? transactionId : undefined,
      adminUserId: user.id,
    }, {
      onSuccess: () => {
        setAdminNotes("");
        setTransactionId("");
        setSelectedRequest(null);
      }
    });
  };

  const handleConfirmPayment = (orderId: string) => {
    confirmPaymentMutation.mutate({
      orderId,
      transactionHash: transactionId || undefined,
    }, {
      onSuccess: () => {
        setTransactionId("");
        setSelectedPaymentOrder(null);
      }
    });
  };

  const handleRejectPayment = (orderId: string) => {
    rejectPaymentMutation.mutate({
      orderId,
      adminNotes: adminNotes || undefined,
    }, {
      onSuccess: () => {
        setAdminNotes("");
        setSelectedPaymentOrder(null);
      }
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600';
      case 'approved': return 'bg-blue-600';
      case 'completed': 
      case 'confirmed': return 'bg-green-600';
      case 'rejected':
      case 'failed': return 'bg-red-600';
      case 'expired': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const safeRequests = Array.isArray(cashoutRequests) ? cashoutRequests : [];
  const safePaymentOrders = Array.isArray(paymentOrders) ? paymentOrders : [];
  
  const pendingRequests = safeRequests.filter(r => r.status === 'pending');
  const approvedRequests = safeRequests.filter(r => r.status === 'approved');
  const completedRequests = safeRequests.filter(r => ['completed', 'rejected'].includes(r.status));
  
  const pendingPayments = safePaymentOrders.filter(p => p.status === 'pending');
  const confirmedPayments = safePaymentOrders.filter(p => ['confirmed', 'failed', 'expired'].includes(p.status));

  if (cashoutLoading || paymentLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Payout Management</h1>
          <p className="text-gray-400">Loading cashout requests and payment orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Payout Management</h1>
        <p className="text-gray-400">Manage user credit cashouts and USDC purchases</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/40 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">{pendingRequests.length}</div>
                <div className="text-gray-400 text-sm">Pending Cashouts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">{pendingPayments.length}</div>
                <div className="text-gray-400 text-sm">Pending Purchases</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {completedRequests.filter(r => r.status === 'completed').length}
                </div>
                <div className="text-gray-400 text-sm">Completed Cashouts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {confirmedPayments.filter(p => p.status === 'confirmed').length}
                </div>
                <div className="text-gray-400 text-sm">Confirmed Purchases</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending-purchases" className="space-y-4">
        <TabsList className="bg-gray-700">
          <TabsTrigger value="pending-purchases" className="data-[state=active]:bg-gray-600">
            Credit Purchases ({pendingPayments.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-gray-600">
            Pending Cashouts ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-gray-600">
            Approved Cashouts ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-gray-600">
            History ({completedRequests.length + confirmedPayments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending-purchases">
          <Card className="bg-gray-800/40 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Pending Credit Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingPayments.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No pending credit purchases</p>
              ) : (
                <div className="space-y-4">
                  {pendingPayments.map((order) => (
                    <div key={order.id} className="bg-gray-900/40 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <User className="h-8 w-8 text-gray-400" />
                          <div>
                            <div className="text-white font-medium">
                              {order.user_profile?.full_name || order.user_profile?.username || 'Unknown User'}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {order.usdc_amount} USDC → {order.credit_amount} credits
                            </div>
                            <div className="text-gray-400 text-xs">
                              From: {order.wallet_address.slice(0, 8)}...{order.wallet_address.slice(-6)}
                            </div>
                            <div className="text-gray-400 text-xs">
                              To: {order.payment_address.slice(0, 8)}...{order.payment_address.slice(-6)}
                            </div>
                            <Badge className="bg-blue-600 text-xs mt-1">
                              {order.blockchain}
                            </Badge>
                            <div className="text-gray-400 text-xs">
                              Created: {new Date(order.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setSelectedPaymentOrder(order)}
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Credit Purchase Order Details</DialogTitle>
                              </DialogHeader>
                              {selectedPaymentOrder && (
                                <div className="space-y-6">
                                  {/* User Info */}
                                  <div className="bg-gray-900/40 rounded-lg p-4">
                                    <h3 className="text-white font-medium mb-3">User Information</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-400">Name:</span>
                                        <span className="text-white ml-2">
                                          {selectedPaymentOrder.user_profile?.full_name || 'Not provided'}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Username:</span>
                                        <span className="text-white ml-2">
                                          {selectedPaymentOrder.user_profile?.username || 'Not provided'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Transaction Details */}
                                  <div className="bg-gray-900/40 rounded-lg p-4">
                                    <h3 className="text-white font-medium mb-3">Purchase Details</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-400">USDC Amount:</span>
                                        <span className="text-white ml-2">{selectedPaymentOrder.usdc_amount}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Credits:</span>
                                        <span className="text-white ml-2">{selectedPaymentOrder.credit_amount}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Blockchain:</span>
                                        <span className="text-white ml-2">{selectedPaymentOrder.blockchain}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Status:</span>
                                        <Badge className={getStatusBadgeColor(selectedPaymentOrder.status)}>
                                          {selectedPaymentOrder.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Wallet Addresses */}
                                  <div className="bg-gray-900/40 rounded-lg p-4">
                                    <h3 className="text-white font-medium mb-3">Payment Addresses</h3>
                                    <div className="space-y-3">
                                      <div>
                                        <span className="text-gray-400 text-sm">From (User Wallet):</span>
                                        <div className="text-white font-mono text-sm bg-gray-800 p-2 rounded">
                                          {selectedPaymentOrder.wallet_address}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-gray-400 text-sm">To (Payment Address):</span>
                                        <div className="text-white font-mono text-sm bg-gray-800 p-2 rounded">
                                          {selectedPaymentOrder.payment_address}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Admin Actions */}
                                  <div className="space-y-4">
                                    <div>
                                      <Label className="text-gray-300">Transaction Hash (Optional)</Label>
                                      <Input
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        className="bg-gray-700 border-gray-600 text-white mt-1"
                                        placeholder="Enter blockchain transaction hash..."
                                      />
                                    </div>
                                    
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => handleConfirmPayment(selectedPaymentOrder.id)}
                                        disabled={confirmPaymentMutation.isPending}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Confirm Payment
                                      </Button>
                                      <Button
                                        onClick={() => handleRejectPayment(selectedPaymentOrder.id)}
                                        disabled={rejectPaymentMutation.isPending}
                                        variant="destructive"
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Reject
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card className="bg-gray-800/40 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Pending Cashout Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No pending cashout requests</p>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="bg-gray-900/40 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <User className="h-8 w-8 text-gray-400" />
                          <div>
                            <div className="text-white font-medium">
                              {request.user_profile?.full_name || request.user_profile?.username || 'Unknown User'}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {request.amount_credits} credits → {request.amount_crypto} USDC
                            </div>
                            <div className="text-gray-400 text-xs">
                              Requested: {new Date(request.requested_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setSelectedRequest(request)}
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Cashout Request Details</DialogTitle>
                              </DialogHeader>
                              {selectedRequest && (
                                <div className="space-y-6">
                                  {/* User Info */}
                                  <div className="bg-gray-900/40 rounded-lg p-4">
                                    <h3 className="text-white font-medium mb-3">User Information</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-400">Name:</span>
                                        <span className="text-white ml-2">
                                          {selectedRequest.user_profile?.full_name || 'Not provided'}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Username:</span>
                                        <span className="text-white ml-2">
                                          {selectedRequest.user_profile?.username || 'Not provided'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Transaction Details */}
                                  <div className="bg-gray-900/40 rounded-lg p-4">
                                    <h3 className="text-white font-medium mb-3">Transaction Details</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-400">Credits:</span>
                                        <span className="text-white ml-2">{selectedRequest.amount_credits}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">USDC:</span>
                                        <span className="text-white ml-2">{selectedRequest.amount_crypto}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Previous Balance:</span>
                                        <span className="text-white ml-2">{selectedRequest.previous_balance}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">New Balance:</span>
                                        <span className="text-white ml-2">{selectedRequest.new_balance}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Wallet Info */}
                                  <div className="bg-gray-900/40 rounded-lg p-4">
                                    <h3 className="text-white font-medium mb-3">Destination Wallet</h3>
                                    <div className="flex items-center gap-2">
                                      <Wallet className="h-4 w-4 text-gray-400" />
                                      <div>
                                        <div className="text-white text-sm">
                                          {selectedRequest.user_wallet?.wallet_name || `${selectedRequest.user_wallet?.blockchain} Wallet`}
                                        </div>
                                        <div className="text-gray-400 text-xs font-mono">
                                          {selectedRequest.user_wallet?.wallet_address}
                                        </div>
                                        <Badge className="bg-blue-600 text-xs mt-1">
                                          {selectedRequest.user_wallet?.blockchain}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Admin Actions */}
                                  <div className="space-y-4">
                                    <div>
                                      <Label className="text-gray-300">Admin Notes (Optional)</Label>
                                      <Textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        className="bg-gray-700 border-gray-600 text-white mt-1"
                                        placeholder="Add notes about this request..."
                                      />
                                    </div>
                                    
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => handleStatusUpdate(selectedRequest.id, 'approved')}
                                        disabled={updateStatusMutation.isPending}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Approve
                                      </Button>
                                      <Button
                                        onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}
                                        disabled={updateStatusMutation.isPending}
                                        variant="destructive"
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Reject
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card className="bg-gray-800/40 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Approved Requests - Ready for Payout</CardTitle>
            </CardHeader>
            <CardContent>
              {approvedRequests.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No approved requests awaiting payout</p>
              ) : (
                <div className="space-y-4">
                  {approvedRequests.map((request) => (
                    <div key={request.id} className="bg-gray-900/40 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <User className="h-8 w-8 text-gray-400" />
                          <div>
                            <div className="text-white font-medium">
                              {request.user_profile?.full_name || request.user_profile?.username || 'Unknown User'}
                            </div>
                            <div className="text-gray-400 text-sm">
                              Send {request.amount_crypto} USDC to {request.user_wallet?.blockchain} wallet
                            </div>
                            <div className="text-gray-400 text-xs font-mono">
                              {request.user_wallet?.wallet_address}
                            </div>
                            <Badge className="bg-blue-600 text-xs mt-1">
                              Approved: {new Date(request.approved_at!).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => setSelectedRequest(request)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark Complete
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-800 border-gray-700 text-white">
                              <DialogHeader>
                                <DialogTitle>Mark Payout as Complete</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="bg-gray-900/40 rounded-lg p-4">
                                  <p className="text-gray-300">
                                    Confirm that you have sent <strong>{selectedRequest?.amount_crypto} USDC</strong> to:
                                  </p>
                                  <p className="text-gray-400 font-mono text-sm mt-2">
                                    {selectedRequest?.user_wallet?.wallet_address}
                                  </p>
                                </div>
                                
                                <div>
                                  <Label className="text-gray-300">Transaction ID/Hash</Label>
                                  <Input
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    className="bg-gray-700 border-gray-600 text-white mt-1"
                                    placeholder="Enter blockchain transaction hash..."
                                  />
                                </div>

                                <div>
                                  <Label className="text-gray-300">Completion Notes (Optional)</Label>
                                  <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="bg-gray-700 border-gray-600 text-white mt-1"
                                    placeholder="Add completion notes..."
                                  />
                                </div>
                                
                                <Button
                                  onClick={() => selectedRequest && handleStatusUpdate(selectedRequest.id, 'completed')}
                                  disabled={updateStatusMutation.isPending || !transactionId.trim()}
                                  className="w-full bg-green-600 hover:bg-green-700"
                                >
                                  {updateStatusMutation.isPending ? "Processing..." : "Confirm Completion"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-gray-800/40 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {completedRequests.length + confirmedPayments.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No completed transactions yet</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {/* Completed Cashouts */}
                  {completedRequests.map((request) => (
                    <div key={`cashout-${request.id}`} className="bg-gray-900/40 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <DollarSign className="h-8 w-8 text-gray-400" />
                          <div>
                            <div className="text-white font-medium">
                              {request.user_profile?.full_name || request.user_profile?.username || 'Unknown User'}
                            </div>
                            <div className="text-gray-400 text-sm">
                              Cashout: {request.amount_credits} credits → {request.amount_crypto} USDC
                            </div>
                            <div className="text-gray-400 text-xs">
                              {request.status === 'completed' ? 'Completed' : 'Rejected'}: {' '}
                              {new Date(request.completed_at || request.updated_at).toLocaleDateString()}
                            </div>
                            {request.transaction_id && (
                              <div className="text-blue-400 text-xs font-mono">
                                TX: {request.transaction_id}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className={getStatusBadgeColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {/* Confirmed Credit Purchases */}
                  {confirmedPayments.map((order) => (
                    <div key={`purchase-${order.id}`} className="bg-gray-900/40 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <CreditCard className="h-8 w-8 text-gray-400" />
                          <div>
                            <div className="text-white font-medium">
                              {order.user_profile?.full_name || order.user_profile?.username || 'Unknown User'}
                            </div>
                            <div className="text-gray-400 text-sm">
                              Purchase: {order.usdc_amount} USDC → {order.credit_amount} credits
                            </div>
                            <div className="text-gray-400 text-xs">
                              {order.status === 'confirmed' ? 'Confirmed' : order.status}: {' '}
                              {new Date(order.confirmed_at || order.updated_at).toLocaleDateString()}
                            </div>
                            {order.transaction_hash && (
                              <div className="text-blue-400 text-xs font-mono">
                                TX: {order.transaction_hash}
                              </div>
                            )}
                            <Badge className="bg-blue-600 text-xs mt-1">
                              {order.blockchain}
                            </Badge>
                          </div>
                        </div>
                        <Badge className={getStatusBadgeColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
