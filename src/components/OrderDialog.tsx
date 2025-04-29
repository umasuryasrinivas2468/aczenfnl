import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"

const OrderDialog = () => {
  const navigate = useNavigate()

  const handleViewOrders = () => {
    navigate('/orders')
  }

  return (
    <Button 
      variant="outline" 
      className="flex-1 h-14 border-dark-blue text-dark-blue hover:bg-dark-blue/5 rounded-lg"
      onClick={handleViewOrders}
    >
      <ShoppingBag className="mr-2" size={18} />
      Order
    </Button>
  )
}

export default OrderDialog
