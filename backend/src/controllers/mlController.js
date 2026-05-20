import Candidate from '../models/Candidate.js';
import Event from '../models/Event.js';
import Vote from '../models/Vote.js';
import User from '../models/User.js';

// AI Sentiment Analysis for Candidate Descriptions
export const analyzeCandidateSentiment = async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Simple sentiment analysis using keyword matching
    const positiveWords = ['excellent', 'great', 'amazing', 'outstanding', 'qualified', 'experienced', 'dedicated', 'committed', 'innovative', 'leader', 'passionate', 'skilled', 'professional', 'successful', 'achievements'];
    const negativeWords = ['poor', 'bad', 'inexperienced', 'unqualified', 'failed', 'weak', 'lacking', 'inadequate', 'unsuccessful', 'problems'];
    
    const text = candidate.bio.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      if (text.includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
      if (text.includes(word)) negativeCount++;
    });
    
    const totalWords = text.split(' ').length;
    const sentimentScore = (positiveCount - negativeCount) / Math.max(totalWords, 1) * 100;
    
    let sentiment = 'neutral';
    if (sentimentScore > 5) sentiment = 'positive';
    if (sentimentScore < -5) sentiment = 'negative';
    
    res.json({
      candidateId: candidate._id,
      candidateName: candidate.name,
      sentiment,
      sentimentScore: sentimentScore.toFixed(2),
      positiveCount,
      negativeCount,
      confidence: Math.min(100, Math.abs(sentimentScore) * 10).toFixed(2)
    });
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ message: 'Sentiment analysis failed' });
  }
};

// ML-based Voter Behavior Prediction
export const predictVoterBehavior = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .populate('votedEvents')
      .populate('joinedEvents');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Analyze user's voting patterns
    const votedEvents = user.votedEvents || [];
    const joinedEvents = user.joinedEvents || [];
    
    // Calculate participation rate
    const participationRate = joinedEvents.length > 0 
      ? (votedEvents.length / joinedEvents.length) * 100 
      : 0;
    
    // Analyze voting timing patterns
    const votes = await Vote.find({ userId }).sort({ timestamp: 1 });
    const votingHours = votes.map(v => v.timestamp.getHours());
    const hourDistribution = {};
    votingHours.forEach(hour => {
      hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
    });
    
    // Find peak voting hour
    const peakHour = Object.entries(hourDistribution)
      .sort((a, b) => b[1] - a[1])[0];
    
    // Predict likelihood of voting in future events
    let predictedLikelihood = participationRate;
    
    // Adjust based on recent activity
    if (votes.length > 0) {
      const lastVote = votes[votes.length - 1];
      const daysSinceLastVote = (Date.now() - lastVote.timestamp) / (1000 * 60 * 60 * 24);
      if (daysSinceLastVote < 7) {
        predictedLikelihood += 10;
      } else if (daysSinceLastVote > 30) {
        predictedLikelihood -= 10;
      }
    }
    
    predictedLikelihood = Math.min(100, Math.max(0, predictedLikelihood));
    
    res.json({
      userId: user._id,
      userName: user.name,
      participationRate: participationRate.toFixed(2),
      totalEventsJoined: joinedEvents.length,
      totalVotesCast: votedEvents.length,
      peakVotingHour: peakHour ? parseInt(peakHour[0]) : null,
      predictedVotingLikelihood: predictedLikelihood.toFixed(2),
      behaviorProfile: {
        active: participationRate > 70,
        moderate: participationRate >= 30 && participationRate <= 70,
        inactive: participationRate < 30
      },
      recommendations: [
        participationRate < 50 ? 'Send reminders to increase participation' : 'User is highly engaged',
        peakHour ? `User most active around ${peakHour[0]}:00 - schedule events accordingly` : 'No clear pattern detected'
      ]
    });
  } catch (error) {
    console.error('Voter behavior prediction error:', error);
    res.status(500).json({ message: 'Behavior prediction failed' });
  }
};

// AI-powered Smart Recommendations for Voters
export const getSmartRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .populate('votedEvents')
      .populate('joinedEvents');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get available events
    const availableEvents = await Event.find({
      status: { $in: ['upcoming', 'active'] },
      _id: { $nin: user.votedEvents }
    }).populate('candidates');

    // Score events based on user preferences
    const scoredEvents = availableEvents.map(event => {
      let score = 0;
      
      // Prefer events from user's organization
      if (event.organizationId && user.organizationId) {
        if (event.organizationId.toString() === user.organizationId.toString()) {
          score += 30;
        }
      }
      
      // Prefer events with more candidates (more choices)
      score += event.candidates.length * 5;
      
      // Prefer active events over upcoming
      if (event.status === 'active') {
        score += 20;
      }
      
      // Prefer events ending soon (urgency)
      const timeUntilEnd = event.endTime - Date.now();
      if (timeUntilEnd < 24 * 60 * 60 * 1000) { // Less than 24 hours
        score += 15;
      }
      
      return {
        event,
        score,
        reasons: []
      };
    });

    // Sort by score and add reasons
    const recommendations = scoredEvents
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(rec => {
        const reasons = [];
        if (rec.score >= 30) reasons.push('Highly relevant to your interests');
        if (rec.event.status === 'active') reasons.push('Voting is currently open');
        if (rec.event.organizationId && user.organizationId && 
            rec.event.organizationId.toString() === user.organizationId.toString()) {
          reasons.push('From your organization');
        }
        if ((rec.event.endTime - Date.now()) < 24 * 60 * 60 * 1000) {
          reasons.push('Ending soon - vote now!');
        }
        
        return {
          eventId: rec.event._id,
          title: rec.event.title,
          description: rec.event.description,
          startTime: rec.event.startTime,
          endTime: rec.event.endTime,
          status: rec.event.status,
          candidateCount: rec.event.candidates.length,
          score: rec.score,
          reasons
        };
      });

    res.json({
      userId: user._id,
      recommendations,
      totalAvailable: availableEvents.length
    });
  } catch (error) {
    console.error('Smart recommendations error:', error);
    res.status(500).json({ message: 'Recommendations failed' });
  }
};

// Advanced Anomaly Detection using ML Algorithms
export const detectAnomalies = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const votes = await Vote.find({ eventId }).populate('userId');
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const anomalies = [];
    
    // 1. Statistical anomaly detection using Z-score
    const voteTimestamps = votes.map(v => v.timestamp.getTime());
    const mean = voteTimestamps.reduce((a, b) => a + b, 0) / voteTimestamps.length;
    const variance = voteTimestamps.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / voteTimestamps.length;
    const stdDev = Math.sqrt(variance);
    
    votes.forEach(vote => {
      const zScore = Math.abs((vote.timestamp.getTime() - mean) / stdDev);
      if (zScore > 3) { // More than 3 standard deviations
        anomalies.push({
          type: 'statistical_anomaly',
          severity: 'high',
          description: 'Unusual voting timing pattern',
          voteId: vote._id,
          zScore: zScore.toFixed(2)
        });
      }
    });
    
    // 2. Clustering anomaly detection
    const userVoteCounts = {};
    votes.forEach(vote => {
      const userId = vote.userId?._id?.toString();
      if (userId) {
        userVoteCounts[userId] = (userVoteCounts[userId] || 0) + 1;
      }
    });
    
    Object.entries(userVoteCounts).forEach(([userId, count]) => {
      if (count > 1) {
        anomalies.push({
          type: 'clustering_anomaly',
          severity: 'critical',
          description: 'Multiple votes from same user',
          userId,
          voteCount: count
        });
      }
    });
    
    // 3. Time-series anomaly detection
    const hourlyVotes = new Array(24).fill(0);
    votes.forEach(vote => {
      const hour = vote.timestamp.getHours();
      hourlyVotes[hour]++;
    });
    
    const avgVotesPerHour = hourlyVotes.reduce((a, b) => a + b, 0) / 24;
    hourlyVotes.forEach((count, hour) => {
      if (count > avgVotesPerHour * 5) {
        anomalies.push({
          type: 'time_series_anomaly',
          severity: 'medium',
          description: 'Unusual spike in voting activity',
          hour,
          voteCount: count,
          average: avgVotesPerHour.toFixed(2)
        });
      }
    });
    
    // 4. Geographic anomaly detection (if IP addresses were available)
    // This would require IP tracking in the Vote model
    
    const anomalyScore = anomalies.length * 10;
    const riskLevel = anomalyScore < 30 ? 'low' : anomalyScore < 60 ? 'medium' : 'high';
    
    res.json({
      eventId: event._id,
      eventTitle: event.title,
      totalVotes: votes.length,
      anomalies,
      anomalyScore: Math.min(100, anomalyScore),
      riskLevel,
      recommendations: [
        riskLevel === 'high' ? 'Immediate investigation recommended' : 'Monitor activity',
        anomalies.filter(a => a.severity === 'critical').length > 0 
          ? 'Critical anomalies detected - consider pausing voting' 
          : 'No critical issues detected'
      ]
    });
  } catch (error) {
    console.error('Anomaly detection error:', error);
    res.status(500).json({ message: 'Anomaly detection failed' });
  }
};

// Natural Language Processing for Event Descriptions
export const analyzeEventDescription = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const description = event.description.toLowerCase();
    
    // Extract keywords
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to'];
    const words = description.split(/\s+/).filter(word => word.length > 3 && !stopWords.includes(word));
    
    const wordFrequency = {};
    words.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    
    const keywords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
    
    // Categorize event type
    const categories = {
      election: ['election', 'vote', 'candidate', 'ballot', 'poll'],
      survey: ['survey', 'feedback', 'opinion', 'poll', 'questionnaire'],
      competition: ['competition', 'contest', 'winner', 'prize', 'award'],
      meeting: ['meeting', 'conference', 'seminar', 'workshop', 'gathering'],
      decision: ['decision', 'choice', 'select', 'choose', 'pick']
    };
    
    let detectedCategory = 'general';
    let categoryScore = 0;
    
    Object.entries(categories).forEach(([category, terms]) => {
      const score = terms.reduce((acc, term) => {
        return acc + (description.includes(term) ? 1 : 0);
      }, 0);
      
      if (score > categoryScore) {
        categoryScore = score;
        detectedCategory = category;
      }
    });
    
    // Calculate readability score (simplified Flesch-Kincaid)
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = words.length / Math.max(sentences.length, 1);
    const syllableCount = words.reduce((acc, word) => {
      return acc + word.split(/[aeiouy]+/).filter(v => v).length;
    }, 0);
    const avgSyllablesPerWord = syllableCount / Math.max(words.length, 1);
    const readabilityScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    
    res.json({
      eventId: event._id,
      eventTitle: event.title,
      description: event.description,
      nlpAnalysis: {
        keywords,
        detectedCategory,
        categoryConfidence: categoryScore > 0 ? (categoryScore / keywords.length * 100).toFixed(2) : 0,
        readabilityScore: readabilityScore.toFixed(2),
        readabilityLevel: readabilityScore > 60 ? 'easy' : readabilityScore > 30 ? 'moderate' : 'difficult',
        wordCount: words.length,
        sentenceCount: sentences.length,
        avgSentenceLength: avgSentenceLength.toFixed(2)
      },
      suggestions: [
        readabilityScore < 30 ? 'Consider simplifying the description for better readability' : 'Description is well-written',
        keywords.length < 5 ? 'Add more descriptive keywords to improve searchability' : 'Good keyword usage',
        categoryScore === 0 ? 'Consider adding category-specific terms for better classification' : 'Category is well-defined'
      ]
    });
  } catch (error) {
    console.error('NLP analysis error:', error);
    res.status(500).json({ message: 'NLP analysis failed' });
  }
};
