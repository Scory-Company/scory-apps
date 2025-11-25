# Personalization Concept - Adaptive Reading Level

## Overview

Scory's personalization feature is designed to **democratize access to academic research** by adapting the complexity of journal content to match each user's reading level and educational background.

## Core Philosophy

> **"Same Research, Different Language Complexity"**

Unlike traditional personalization that focuses on content recommendations, Scory's personalization adapts **how the content is presented** to ensure everyone can understand academic research regardless of their educational background.

## Key Principle

**"Semua lini masyarakat bisa membaca jurnal tanpa memandang latar belakang pendidikan"**

Translation: "All levels of society can read journals regardless of educational background"

## How It Works

The same research article is presented with different levels of language complexity and explanation depth based on the user's selected reading level:

### Reading Levels

1. **Researcher/Academic Level**
   - Target: Researchers, PhD students, academics
   - Style: Full academic terminology and jargon maintained
   - Content: Complete methodology, statistical analysis, technical details
   - Language: Formal academic writing style
   - Example: Original journal article format

2. **University Student Level**
   - Target: Undergraduate/graduate students
   - Style: Simplified explanations with key concepts highlighted
   - Content: Focus on main findings and implications
   - Language: Semi-formal with technical terms explained
   - Example: Abstract + key findings with context

3. **High School Level (SMA)**
   - Target: High school students, curious learners
   - Style: Light, accessible language
   - Content: Main ideas and practical applications
   - Language: Everyday language with minimal jargon
   - Example: "What did they discover and why does it matter?"

4. **General Public / Younger Readers**
   - Target: Middle school students, general public
   - Style: Super simplified, storytelling approach
   - Content: Core message only with relatable analogies
   - Language: Conversational, visual aids, infographics
   - Example: "Explain like I'm 5" approach

## Implementation Goals

### Primary Objectives

1. **Accessibility**: Make academic research accessible to everyone
2. **Engagement**: Keep users engaged with content at their comprehension level
3. **Learning**: Help users progressively understand more complex concepts
4. **Inclusivity**: Remove educational barriers to knowledge

### User Experience Principles

- **Non-judgmental**: No level is "better" or "worse"
- **Flexible**: Users can switch levels anytime
- **Progressive**: Users can gradually move to higher levels
- **Transparent**: Clear preview of what each level offers

## Technical Considerations

### Content Adaptation Strategy

- **Option 1**: Pre-generated content at multiple levels (stored in database)
- **Option 2**: AI-powered real-time simplification/complexification
- **Option 3**: Hybrid approach (pre-generated for popular, AI for long-tail)

### Data Collection

Minimal data needed:
- Selected reading level
- Optional: Educational background (for better initial recommendations)
- Optional: Field of interest

### Privacy & Personalization

- Reading level stored locally (AsyncStorage)
- Can be changed anytime without data loss
- No stigma attached to any level selection

## User Flow

1. **First-time Setup**
   - User opens app for first time
   - PersonalizationCard appears with indicator
   - User selects preferred reading level
   - Preview example shown for each level

2. **Reading Experience**
   - Articles automatically displayed at selected level
   - Easy toggle to view other levels (educational feature)
   - Progress tracking optional

3. **Level Adjustment**
   - User can change level anytime in settings
   - App suggests level adjustment based on reading patterns (optional)

## Design Guidelines for PersonalizationCard

### Visual Design Principles

1. **Approachable & Friendly**
   - Use welcoming colors and icons
   - Avoid academic/intimidating imagery
   - Clear visual hierarchy

2. **Clear Value Communication**
   - Lead with benefit: "Read research your way"
   - Show transformation visually (complex → simple)
   - Use inclusive language

3. **Interactive & Engaging**
   - Preview examples for each level
   - Smooth animations and transitions
   - Immediate visual feedback

4. **Non-intimidating**
   - Frame positively: "Choose your starting point"
   - Avoid labels like "basic" or "advanced"
   - Use growth-oriented language

## Success Metrics

- **Engagement**: Increased article completion rates
- **Retention**: Users return more frequently
- **Progression**: Users gradually move to higher levels
- **Satisfaction**: Positive feedback on content clarity

## Future Enhancements

- **Adaptive Learning**: AI learns user's comprehension and suggests optimal level
- **Mixed Levels**: Some sections simple, some detailed (user preference)
- **Translation**: Combine with language translation for global access
- **Audio/Video**: Multi-modal content adaptation

## Related Features

This personalization concept impacts:
- Article reading experience
- Search and recommendations
- Bookmarking and collections
- Learning progress tracking

---

**Document Status**: Initial Concept (Created: 2025-11-20)

**Last Updated**: 2025-11-20

**Owner**: Habdil Iqrawardana (PM), Tiko (Senior Mobile Programmer)
