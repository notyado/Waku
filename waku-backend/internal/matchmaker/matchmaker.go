package matchmaker

import (
	"sort"
	"sync"
	"time"
)

type Entry struct {
	UserID   string
	Tags     []string
	JoinedAt time.Time
}

type Matchmaker struct {
	mu    sync.Mutex
	queue []*Entry
}

func New() *Matchmaker {
	return &Matchmaker{}
}

func (m *Matchmaker) Add(e *Entry) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.queue = append(m.queue, e)
}

func (m *Matchmaker) Remove(userID string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.removeNoLock(userID)
}

func (m *Matchmaker) FindMatch(entry *Entry) (*Entry, []string) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if len(m.queue) == 0 {
		return nil, nil
	}

	tagSet := make(map[string]struct{}, len(entry.Tags))
	for _, t := range entry.Tags {
		tagSet[t] = struct{}{}
	}

	type candidate struct {
		entry      *Entry
		commonTags []string
	}

	var withOverlap []candidate
	var anyOther []*Entry

	for _, e := range m.queue {
		if e.UserID == entry.UserID {
			continue
		}
		var common []string
		for _, t := range e.Tags {
			if _, ok := tagSet[t]; ok {
				common = append(common, t)
			}
		}
		if len(common) > 0 {
			withOverlap = append(withOverlap, candidate{e, common})
		} else {
			anyOther = append(anyOther, e)
		}
	}

	if len(withOverlap) > 0 {
		sort.Slice(withOverlap, func(i, j int) bool {
			si, sj := len(withOverlap[i].commonTags), len(withOverlap[j].commonTags)
			if si != sj {
				return si > sj
			}
			return withOverlap[i].entry.JoinedAt.Before(withOverlap[j].entry.JoinedAt)
		})
		best := withOverlap[0]
		m.removeNoLock(best.entry.UserID)
		return best.entry, best.commonTags
	}

	if len(anyOther) > 0 {
		sort.Slice(anyOther, func(i, j int) bool {
			return anyOther[i].JoinedAt.Before(anyOther[j].JoinedAt)
		})
		fallback := anyOther[0]
		m.removeNoLock(fallback.UserID)
		return fallback, nil
	}

	return nil, nil
}

func (m *Matchmaker) QueueLen() int {
	m.mu.Lock()
	defer m.mu.Unlock()
	return len(m.queue)
}

func (m *Matchmaker) removeNoLock(userID string) {
	for i, e := range m.queue {
		if e.UserID == userID {
			m.queue = append(m.queue[:i], m.queue[i+1:]...)
			return
		}
	}
}
