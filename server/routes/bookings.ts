import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";
import { insertBookingSchema, insertBookingShareSchema } from "@shared/schema";
import { z } from "zod";

export function registerBookingRoutes(app: Express) {
  // Get bookings for a group
  app.get("/api/groups/:groupId/bookings", isAuthenticated, async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const userId = (req as any).user.claims.sub;
      
      // Check if user is a member of the group
      const member = await storage.getGroupMembership(groupId, userId);
      if (!member) {
        return res.status(403).json({ message: "You are not a member of this group" });
      }
      
      const bookings = await storage.getBookingsForGroup(groupId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching group bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });
  
  // Get bookings for partner space
  app.get("/api/partner/bookings", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const partnerSpace = await storage.getPartnerSpace(userId);
      
      if (!partnerSpace) {
        return res.status(404).json({ message: "Partner space not found" });
      }
      
      const bookings = await storage.getBookingsForPartnerSpace(partnerSpace.id);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching partner bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });
  
  // Get user's bookings
  app.get("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const bookings = await storage.getBookingsForUser(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });
  
  // Get shared bookings
  app.get("/api/bookings/shared", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const bookings = await storage.getSharedBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching shared bookings:", error);
      res.status(500).json({ message: "Failed to fetch shared bookings" });
    }
  });
  
  // Create a booking
  app.post("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const bookingData = insertBookingSchema.extend({
        shares: z.array(z.object({
          sharedWithUserId: z.string().optional(),
          sharedWithGroupId: z.number().optional(),
          canEdit: z.boolean().optional()
        })).optional()
      }).parse(req.body);
      
      // Verify user has permission to create booking in the group/partner space
      if (bookingData.groupId) {
        const member = await storage.getGroupMembership(bookingData.groupId, userId);
        if (!member) {
          return res.status(403).json({ message: "You are not a member of this group" });
        }
      } else if (bookingData.partnerSpaceId) {
        const partnerSpace = await storage.getPartnerSpace(userId);
        if (!partnerSpace || partnerSpace.id !== bookingData.partnerSpaceId) {
          return res.status(403).json({ message: "You don't have access to this partner space" });
        }
      }
      
      // Extract shares from the booking data
      const { shares, ...bookingDetails } = bookingData;
      
      // Create the booking
      const booking = await storage.createBooking({
        ...bookingDetails,
        bookedBy: userId
      });
      
      // Add shares if provided
      if (shares && shares.length > 0) {
        for (const share of shares) {
          await storage.shareBooking({
            bookingId: booking.id,
            sharedWithUserId: share.sharedWithUserId,
            sharedWithGroupId: share.sharedWithGroupId,
            canEdit: share.canEdit || false
          });
        }
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });
  
  // Update a booking
  app.patch("/api/bookings/:bookingId", isAuthenticated, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId);
      const userId = (req as any).user.claims.sub;
      
      // Get the booking to check permissions
      const bookings = await storage.getBookingsForUser(userId);
      const booking = bookings.find(b => b.id === bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found or you don't have access" });
      }
      
      // Only the creator can update the booking
      if (booking.bookedBy !== userId) {
        return res.status(403).json({ message: "Only the person who made the booking can update it" });
      }
      
      const updates = insertBookingSchema.partial().parse(req.body);
      const updatedBooking = await storage.updateBooking(bookingId, updates);
      
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });
  
  // Delete a booking
  app.delete("/api/bookings/:bookingId", isAuthenticated, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId);
      const userId = (req as any).user.claims.sub;
      
      // Get the booking to check permissions
      const bookings = await storage.getBookingsForUser(userId);
      const booking = bookings.find(b => b.id === bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found or you don't have access" });
      }
      
      // Only the creator can delete the booking
      if (booking.bookedBy !== userId) {
        return res.status(403).json({ message: "Only the person who made the booking can delete it" });
      }
      
      await storage.deleteBooking(bookingId);
      res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });
  
  // Share a booking
  app.post("/api/bookings/:bookingId/share", isAuthenticated, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId);
      const userId = (req as any).user.claims.sub;
      const shareData = insertBookingShareSchema.parse({ ...req.body, bookingId });
      
      // Get the booking to check permissions
      const bookings = await storage.getBookingsForUser(userId);
      const booking = bookings.find(b => b.id === bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found or you don't have access" });
      }
      
      // Only the creator can share the booking
      if (booking.bookedBy !== userId) {
        return res.status(403).json({ message: "Only the person who made the booking can share it" });
      }
      
      await storage.shareBooking(shareData);
      res.json({ message: "Booking shared successfully" });
    } catch (error) {
      console.error("Error sharing booking:", error);
      res.status(500).json({ message: "Failed to share booking" });
    }
  });
  
  // Unshare a booking
  app.delete("/api/bookings/:bookingId/share", isAuthenticated, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId);
      const userId = (req as any).user.claims.sub;
      const { sharedWithUserId, sharedWithGroupId } = req.body;
      
      // Get the booking to check permissions
      const bookings = await storage.getBookingsForUser(userId);
      const booking = bookings.find(b => b.id === bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found or you don't have access" });
      }
      
      // Only the creator can unshare the booking
      if (booking.bookedBy !== userId) {
        return res.status(403).json({ message: "Only the person who made the booking can unshare it" });
      }
      
      await storage.unshareBooking(bookingId, sharedWithUserId, sharedWithGroupId);
      res.json({ message: "Booking unshared successfully" });
    } catch (error) {
      console.error("Error unsharing booking:", error);
      res.status(500).json({ message: "Failed to unshare booking" });
    }
  });
}