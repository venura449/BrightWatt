import { FontAwesome } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Lesson } from '../lib/api';

interface VideoModalProps {
  videoModalVisible: boolean;
  closeVideoModal: () => void;
  currentVideo: Lesson | null;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoModalVisible, closeVideoModal, currentVideo }) => {
  const [playing, setPlaying] = useState(true);

  const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) {
      console.log('No URL provided to extractYouTubeVideoId');
      return null;
    }
    
    console.log('Extracting video ID from URL:', url);
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    console.log('Extracted video ID:', videoId);
    return videoId;
  };

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  }, []);

  return (
    <Modal
      visible={videoModalVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={closeVideoModal}
    >
      <View style={styles.videoModalContainer}>
        {/* Header */}
        <View style={styles.videoModalHeader}>
          <TouchableOpacity onPress={closeVideoModal} style={styles.closeVideoButton}>
            <FontAwesome name="times" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.videoModalTitle}>
            {currentVideo?.title || 'Video Lesson'}
          </Text>
        </View>

        {/* Video Player */}
        {currentVideo && (
          <View style={styles.videoPlayerContainer}>
            {(() => {
              const videoId = extractYouTubeVideoId(currentVideo.youtubeUrl);
              console.log('Rendering YoutubePlayer with videoId:', videoId);
              console.log('Current video:', currentVideo);
              
              if (!videoId) {
                return (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Invalid YouTube URL</Text>
                    <Text style={styles.errorText}>URL: {currentVideo.youtubeUrl}</Text>
                  </View>
                );
              }
              
              return (
                <YoutubePlayer
                  height={300}
                  width="100%"
                  play={playing}
                  videoId={videoId}
                  onChangeState={onStateChange}
                  webViewProps={{
                    allowsFullscreenVideo: true,
                    androidLayerType: 'hardware',
                    androidHardwareAccelerationDisabled: false,
                  }}
                  onError={(error: any) => {
                    console.log('YoutubePlayer error:', error);
                  }}
                  onReady={() => {
                    console.log('YoutubePlayer ready');
                  }}
                  onPlaybackQualityChange={(quality: any) => {
                    console.log('Playback quality changed:', quality);
                  }}
                />
              );
            })()}
          </View>
        )}

        {/* Controls / Instructions */}
        <View style={styles.videoControls}>
          <Text style={styles.videoInstructions}>
            Use YouTube's built-in controls to play, pause, and navigate the video
          </Text>
          <Text style={styles.videoFallback}>
            If the video doesn't load, you can also{' '}
            <Text
              style={styles.videoLink}
              onPress={() => {
                if (currentVideo?.youtubeUrl) {
                  console.log('Opening external link:', currentVideo.youtubeUrl);
                  // Linking.openURL(currentVideo.youtubeUrl) if you want to open in browser
                }
              }}
            >
              open it in your browser
            </Text>
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  videoModalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#111',
  },
  closeVideoButton: {
    marginRight: 12,
  },
  videoModalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  videoPlayerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 10,
  },
  videoControls: {
    padding: 16,
  },
  videoInstructions: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 8,
  },
  videoFallback: {
    color: '#ccc',
    fontSize: 14,
  },
  videoLink: {
    color: '#1e90ff',
    textDecorationLine: 'underline',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default VideoModal;
