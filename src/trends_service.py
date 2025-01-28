from pytrends.request import TrendReq
import json
import sys
from datetime import datetime
import time
import pandas as pd
import re

# Common sports-related keywords to filter out
SPORTS_KEYWORDS = [
    # Match patterns
    r'\bvs\b',           # Matches team vs team
    r'score',
    r'game',
    r'match',
    r'championship',
    r'tournament',
    r'playoffs',
    r'finals',
    r'event',           # For sporting events
    
    # Sports leagues and organizations
    r'nfl',
    r'nba',
    r'mlb',
    r'nhl',
    r'uefa',
    r'fifa',
    r'wwe',            # Wrestling
    r'aew',            # Wrestling
    r'ufc',            # MMA
    r'boxing',
    r'wrestl',         # Catches wrestling, wrestler
    
    # Team/venue identifiers
    r'fc\b',
    r'united',
    r'athletic',
    r'team',
    r'arena',
    r'stadium',
    r'city(?=\s+fc|\s+united|\s+vs)',  # Only match "city" in sports context
    
    # Sports terms
    r'basketball',
    r'football',
    r'baseball',
    r'soccer',
    r'hockey',
    r'tennis',
    r'golf',
    r'racing',
    r'formula',        # Formula 1
    r'grand\s+prix',
    
    # Common team/venue words
    r'eagles',
    r'chiefs',
    r'bucks',
    r'madrid',
    r'arsenal',
    r'lakers',
    r'warriors',
    r'manchester',
    r'liverpool',
    r'chelsea',
    
    # Individual sports
    r'(?:^|\s)f1\b',   # Formula 1 abbreviation
    r'boxing',
    r'mma',
    r'wrestling',
    
    # Tennis specific
    r'(?:^|\s)atp\b',
    r'(?:^|\s)wta\b',
    r'grand\s+slam',
    r'australian\s+open',
    r'french\s+open',
    r'wimbledon',
    r'us\s+open',
    
    # Common sports people/roles
    r'player',
    r'coach',
    r'manager',
    r'referee',
    r'athlete',
    
    # Current tennis players (top ranked)
    r'djokovic',
    r'alcaraz',
    r'medvedev',
    r'sinner',
    r'rublev',
    r'sabalenka',
    r'swiatek',
    r'gauff',
    r'jabeur',
    
    # Wrestling terms
    r'smackdown',
    r'raw\b',
    r'wrestlemania',
    r'main\s+event',    # Usually wrestling/boxing context
]

def is_sports_related(topic):
    """Check if a topic is sports-related based on keywords."""
    topic_lower = topic.lower()
    
    # Check against all sports keywords
    if any(re.search(pattern, topic_lower) for pattern in SPORTS_KEYWORDS):
        return True
        
    # Additional checks for ambiguous terms
    if re.search(r'city', topic_lower):
        # Check if "city" is used in a likely sports context
        sports_context = re.search(r'(match|game|play|league|cup|win|lose|draw|score|stadium|arena)', topic_lower)
        if sports_context:
            return True
    
    return False

def get_trending_topics():
    try:
        # Suppress pandas warnings
        pd.options.mode.chained_assignment = None
        
        # Initialize pytrends
        pytrends = TrendReq(hl='en-US', tz=360, timeout=(10,25))
        
        # Get trending searches
        print("Fetching trending searches...", file=sys.stderr)
        trending_searches_df = pytrends.trending_searches(pn='united_states')
        trends = []
        processed_count = 0
        
        # Process topics until we have 5 non-sports topics
        for topic in trending_searches_df.values:
            if processed_count >= 5:
                break
                
            topic_name = topic[0]
            
            # Skip sports-related topics
            if is_sports_related(topic_name):
                print(f"Skipping sports topic: {topic_name}", file=sys.stderr)
                continue
                
            print(f"Processing topic: {topic_name}", file=sys.stderr)
            
            try:
                # Build payload
                pytrends.build_payload(
                    kw_list=[topic_name],
                    timeframe='now 7-d'
                )
                
                # Get search volume
                search_volume = "500,000+"  # Default
                try:
                    interest = pytrends.interest_over_time()
                    if not interest.empty and topic_name in interest:
                        recent_interest = interest[topic_name].iloc[-7:]
                        if not recent_interest.empty:
                            avg_interest = recent_interest.mean()
                            # Scale the interest value to a reasonable search volume
                            volume = int(avg_interest * 20000)
                            # Round to nearest thousand for cleaner numbers
                            volume = round(volume / 1000) * 1000
                            search_volume = f"{volume}+"
                except Exception as e:
                    print(f"Failed to get interest data: {str(e)}", file=sys.stderr)
                
                trends.append({
                    "title": topic_name,
                    "searchVolume": search_volume,
                    "timestamp": datetime.now().isoformat()
                })
                
                processed_count += 1
                
                # Add delay between requests
                time.sleep(2)
                
            except Exception as e:
                print(f"Error processing topic {topic_name}: {str(e)}", file=sys.stderr)
                continue
        
        if not trends:
            raise Exception("No suitable non-sports topics could be fetched")
            
        # Output JSON to stdout
        print(json.dumps({"trends": trends}))
        
    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "trends": []
        }))
        sys.exit(1)

if __name__ == "__main__":
    get_trending_topics() 