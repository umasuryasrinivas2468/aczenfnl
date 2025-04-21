
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { History, TrendingUp } from "lucide-react"

const SellDialog = () => {
  const navigate = useNavigate()

  const handleViewHistory = () => {
    navigate('/history')
  }

  return (
    <Button 
      variant="outline" 
      className="flex-1 h-14 border-dark-blue text-dark-blue hover:bg-dark-blue/5 rounded-lg"
      onClick={handleViewHistory}
    >
      <TrendingUp className="mr-2" size={18} />
      Sell
    </Button>
  )
}

export default SellDialog
